import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

// GET ORDERS
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit")) || 10, 1),
      100
    );

    const page = Math.max(
      parseInt(searchParams.get("page")) || 1,
      1
    );

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    // Search by orderNumber, customer name, or email
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customer: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status (ignore "All Status")
    if (status && status !== "All Status") {
      filter.status = { $regex: `^${status}$`, $options: "i" };
    }

    // Filter by paymentStatus (ignore "All")
    if (paymentStatus && paymentStatus !== "All") {
      filter.paymentStatus = { $regex: `^${paymentStatus}$`, $options: "i" };
    }

    // Get total count
    const total = await Order.countDocuments(filter);

    // Calculate pagination
    const totalPages = Math.ceil(total / limit) || 1;

    // Get orders
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: orders,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          perPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          previousPage: page > 1 ? page - 1 : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// CREATE ORDER
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      orderNumber,
      customer,
      customerName,
      email,
      phone,
      items,
      total,
      subtotal,
      discount,
      paymentMethod,
      paymentStatus,
      status,
      products,
      deliveryNotes,
      adminNotes,
    } = body;

    const custName = customer || customerName;

    if (!custName || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer name and email are required",
        },
        { status: 400 }
      );
    }

    // Generate auto order number if none provided
    const genOrderNumber =
      orderNumber ||
      `ORD-${new Date().getFullYear()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    // Check if orderNumber already exists
    const existing = await Order.findOne({ orderNumber: genOrderNumber });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Order number already exists",
        },
        { status: 409 }
      );
    }

    const order = await Order.create({
      orderNumber: genOrderNumber,
      customer: custName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : "",
      items: items !== undefined ? Number(items) : (products?.length || 1),
      total: Number(total || 0),
      subtotal: subtotal !== undefined ? Number(subtotal) : Number(total || 0),
      discount: discount !== undefined ? Number(discount) : 0,
      paymentMethod: paymentMethod || "Cash on Delivery",
      paymentStatus: paymentStatus || "Pending",
      status: status || "Pending",
      products: Array.isArray(products) ? products : [],
      deliveryNotes: deliveryNotes || "",
      adminNotes: adminNotes || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

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

// UPDATE ORDER
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      id,
      customer,
      email,
      phone,
      total,
      paymentMethod,
      paymentStatus,
      status,
      deliveryNotes,
      adminNotes,
      products,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    if (customer !== undefined) order.customer = customer.trim();
    if (email !== undefined) order.email = email.toLowerCase().trim();
    if (phone !== undefined) order.phone = phone.trim();
    if (total !== undefined) order.total = Number(total);
    if (paymentMethod !== undefined) order.paymentMethod = paymentMethod;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
    if (status !== undefined) order.status = status;
    if (deliveryNotes !== undefined) order.deliveryNotes = deliveryNotes;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;
    if (Array.isArray(products)) {
      order.products = products;
      order.items = products.reduce((acc, p) => acc + (p.quantity || 1), 0);
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE ORDER
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required",
        },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
      data: order,
    });
  } catch (error) {
    console.error("Delete order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
