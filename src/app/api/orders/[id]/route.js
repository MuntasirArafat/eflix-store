import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

// GET PUBLIC SINGLE ORDER (by ObjectId or orderNumber)
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    let order = null;

    if (mongoose.isValidObjectId(id)) {
      order = await Order.findById(id).lean();
    }

    if (!order) {
      order = await Order.findOne({ orderNumber: id }).lean();
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Return safe customer fields
    return NextResponse.json(
      {
        success: true,
        data: {
          id: order._id,
          orderNumber: order.orderNumber,
          customer: order.customer,
          email: order.email,
          phone: order.phone,
          items: order.items,
          total: order.total,
          subtotal: order.subtotal,
          discount: order.discount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          status: order.status,
          createdAt: order.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET public order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
