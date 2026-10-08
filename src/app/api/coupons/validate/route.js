import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

// POST /api/coupons/validate
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, message: "Please enter a coupon code." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = Math.max(Number(subtotal) || 0, 0);

    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon code." },
        { status: 404 }
      );
    }

    if (coupon.status !== "Active") {
      return NextResponse.json(
        { success: false, message: "This coupon is currently inactive." },
        { status: 400 }
      );
    }

    // Check expiration
    if (coupon.expiryDate) {
      const now = new Date();
      const expiry = new Date(coupon.expiryDate);
      // End of expiry day
      expiry.setHours(23, 59, 59, 999);
      if (now > expiry) {
        return NextResponse.json(
          { success: false, message: "This coupon has expired." },
          { status: 400 }
        );
      }
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.used >= coupon.usageLimit) {
      return NextResponse.json(
        {
          success: false,
          message: "This coupon has reached its maximum usage limit.",
        },
        { status: 400 }
      );
    }

    // Check minimum purchase requirement
    if (coupon.minimumPurchase > 0 && orderSubtotal < coupon.minimumPurchase) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum purchase of ৳${coupon.minimumPurchase.toLocaleString(
            "en-BD"
          )} required for this coupon.`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "Percentage") {
      discountAmount = (orderSubtotal * coupon.discount) / 100;
      if (coupon.maximumDiscount && coupon.maximumDiscount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
      }
    } else {
      discountAmount = Math.min(coupon.discount, orderSubtotal);
    }

    // Round discount to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;
    const newTotal = Math.max(0, orderSubtotal - discountAmount);

    return NextResponse.json(
      {
        success: true,
        message: `Coupon "${coupon.code}" applied successfully!`,
        data: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discount,
          discountAmount,
          newTotal,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Validate coupon error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to validate coupon.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
