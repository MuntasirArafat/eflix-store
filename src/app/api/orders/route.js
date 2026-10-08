import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import Subscriber from "@/models/Subscriber";
import Setting from "@/models/Setting";
import Admin from "@/models/Admin";
import { enqueueMultipleEmailJobs } from "@/lib/emailWorker";
import {
  generateCustomerOrderEmail,
  generateAdminOrderEmail,
} from "@/lib/emailTemplates";

// POST PUBLIC ORDER (Customer Checkout)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      customer,
      name,
      email,
      phone,
      items,
      paymentMethod,
      transactionId,
      deliveryNotes,
      coupon,
      couponCode,
    } = body;

    const customerName = (customer || name || "").trim();
    if (!customerName) {
      return NextResponse.json(
        { success: false, message: "Customer name is required" },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Process order items
    let processedItems = [];
    let calculatedTotal = 0;

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const qty = Math.max(parseInt(item.quantity) || 1, 1);
        let itemPrice = Number(item.price) || 0;
        let itemName = item.name || item.title || "Product";
        let itemImage = item.image || "";

        // If productId provided, verify against DB
        if (item.productId || item.id) {
          const dbProd = await Product.findById(item.productId || item.id);
          if (dbProd) {
            itemName = dbProd.name;
            if (dbProd.image) itemImage = dbProd.image;

            let attributePricesSum = 0;
            let foundCustomPrice = false;
            if (item.attributes && dbProd.attributes) {
              dbProd.attributes.forEach((attr) => {
                const chosen = item.attributes[attr.name];
                const matched = attr.options?.find(
                  (o) => (typeof o === "string" ? o : o.label) === chosen
                );
                if (
                  matched &&
                  typeof matched === "object" &&
                  matched.price !== null &&
                  matched.price !== undefined &&
                  matched.price !== "" &&
                  Number(matched.price) > 0
                ) {
                  attributePricesSum += Number(matched.price);
                  foundCustomPrice = true;
                }
              });
            }
            if (foundCustomPrice) {
              itemPrice = attributePricesSum;
            } else {
              itemPrice = Number(item.price) || dbProd.price;
            }
          }
        }

        const lineTotal = itemPrice * qty;
        calculatedTotal += lineTotal;

        processedItems.push({
          name: itemName,
          price: itemPrice,
          quantity: qty,
          image: itemImage,
          attributes: item.attributes || undefined,
        });
      }
    } else {
      // Fallback single item order
      const price = Number(body.price || body.total) || 0;
      calculatedTotal = price;
      processedItems.push({
        name: body.productName || "Product",
        price,
        quantity: 1,
        image: body.image || "",
      });
    }

    // Process Coupon
    let discountAmount = 0;
    let appliedCouponCode = "";

    const rawCoupon = (coupon || couponCode || "").trim().toUpperCase();
    if (rawCoupon) {
      const couponDoc = await Coupon.findOne({ code: rawCoupon });
      if (couponDoc && couponDoc.status === "Active") {
        let valid = true;
        if (couponDoc.expiryDate) {
          const expiry = new Date(couponDoc.expiryDate);
          expiry.setHours(23, 59, 59, 999);
          if (new Date() > expiry) valid = false;
        }
        if (couponDoc.usageLimit > 0 && couponDoc.used >= couponDoc.usageLimit) {
          valid = false;
        }
        if (couponDoc.minimumPurchase > 0 && calculatedTotal < couponDoc.minimumPurchase) {
          valid = false;
        }

        if (valid) {
          appliedCouponCode = couponDoc.code;
          if (couponDoc.discountType === "Percentage") {
            discountAmount = (calculatedTotal * couponDoc.discount) / 100;
            if (couponDoc.maximumDiscount > 0) {
              discountAmount = Math.min(discountAmount, couponDoc.maximumDiscount);
            }
          } else {
            discountAmount = Math.min(couponDoc.discount, calculatedTotal);
          }
          discountAmount = Math.round(discountAmount * 100) / 100;

          // Increment usage count atomically
          await Coupon.updateOne({ _id: couponDoc._id }, { $inc: { used: 1 } });
        }
      }
    }

    if (!discountAmount && body.discount) {
      discountAmount = Number(body.discount) || 0;
    }

    // Generate unique order number (e.g. ORD-2026-9281)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().getFullYear();
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    const newOrder = await Order.create({
      orderNumber,
      customer: customerName,
      email: email.toLowerCase().trim(),
      phone: (phone || "").trim(),
      items: processedItems.reduce((sum, i) => sum + (i.quantity || 1), 0),
      products: processedItems,
      subtotal: calculatedTotal,
      discount: discountAmount,
      total: Math.max(calculatedTotal - discountAmount, 0),
      paymentMethod: paymentMethod || "bKash",
      transactionId: (transactionId || "").trim().toUpperCase(),
      paymentStatus: "Pending",
      status: "Pending",
      deliveryNotes: deliveryNotes || "",
      coupon: appliedCouponCode || "",
    });

    const cleanEmail = email.toLowerCase().trim();

    // 1. Auto-subscribe customer so they become a subscriber for future marketing/promotional campaigns
    try {
      await Subscriber.findOneAndUpdate(
        { email: cleanEmail },
        {
          $set: {
            email: cleanEmail,
            name: customerName,
            phone: (phone || "").trim(),
            status: "active",
            source: "checkout",
            lastOrderAt: new Date(),
          },
          $inc: { ordersCount: 1 },
        },
        { upsert: true, new: true }
      );
    } catch (subErr) {
      console.error("[Orders] Failed to register customer as subscriber:", subErr);
    }

    // 2. Enqueue background email jobs for Customer and Admin
    try {
      const settings = await Setting.findOne({ key: "general_settings" }).lean();

      // Determine site origin for dashboard links
      const hostHeader = request.headers.get("host") || "localhost:3000";
      const protocol =
        request.headers.get("x-forwarded-proto") ||
        (hostHeader.includes("localhost") ? "http" : "https");
      const origin = `${protocol}://${hostHeader}`;
      const adminOrderUrl = `${origin}/admin/dashboard/orders/${newOrder._id}`;

      // Customer Confirmation Job
      const customerHtml = generateCustomerOrderEmail(newOrder, settings);
      const customerJob = {
        type: "order_customer",
        recipient: cleanEmail,
        recipientName: customerName,
        subject: `Order Confirmation - #${orderNumber} | ${settings?.mail?.fromName || "Eflix"}`,
        html: customerHtml,
        data: {
          orderId: newOrder._id.toString(),
          orderNumber,
          role: "customer",
        },
      };

      // Admin Alert Job(s)
      const admins = await Admin.find({}).select("email name").lean();
      const adminEmailSet = new Set();
      admins.forEach((a) => {
        if (a.email && a.email.includes("@")) {
          adminEmailSet.add(a.email.toLowerCase().trim());
        }
      });
      if (settings?.mail?.fromEmail && settings.mail.fromEmail.includes("@")) {
        adminEmailSet.add(settings.mail.fromEmail.toLowerCase().trim());
      }

      const adminHtml = generateAdminOrderEmail(newOrder, settings, adminOrderUrl);
      const adminJobs = Array.from(adminEmailSet).map((adminEmail) => ({
        type: "order_admin",
        recipient: adminEmail,
        recipientName: "Admin",
        subject: `🚨 New Order Alert: #${orderNumber} (৳${Number(newOrder.total).toLocaleString("en-BD")})`,
        html: adminHtml,
        data: {
          orderId: newOrder._id.toString(),
          orderNumber,
          role: "admin",
        },
      }));

      // Non-blocking queue insertion and background worker kick-off
      await enqueueMultipleEmailJobs([customerJob, ...adminJobs]);
    } catch (emailJobErr) {
      console.error("[Orders] Failed to enqueue order email jobs:", emailJobErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully!",
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST public order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
