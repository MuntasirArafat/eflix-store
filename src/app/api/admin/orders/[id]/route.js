import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

async function findOrderByIdOrNumber(id) {
  if (mongoose.isValidObjectId(id)) {
    const order = await Order.findById(id);
    if (order) return order;
  }
  return await Order.findOne({ orderNumber: id });
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await findOrderByIdOrNumber(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 200 }
    );
  } catch (error) {
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

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const order = await findOrderByIdOrNumber(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    if (body.customer !== undefined) order.customer = body.customer.trim();
    if (body.customerName !== undefined) order.customer = body.customerName.trim();
    if (body.email !== undefined) order.email = body.email.toLowerCase().trim();
    if (body.phone !== undefined) order.phone = body.phone.trim();
    if (body.total !== undefined) order.total = Number(body.total);
    if (body.paymentMethod !== undefined) order.paymentMethod = body.paymentMethod;
    if (body.transactionId !== undefined) order.transactionId = body.transactionId.trim().toUpperCase();
    if (body.paymentStatus !== undefined) order.paymentStatus = body.paymentStatus;
    if (body.status !== undefined) order.status = body.status;
    if (body.deliveryNotes !== undefined) order.deliveryNotes = body.deliveryNotes;
    if (body.adminNotes !== undefined) order.adminNotes = body.adminNotes;
    if (Array.isArray(body.products)) {
      order.products = body.products;
      order.items = body.products.reduce((acc, p) => acc + (p.quantity || 1), 0);
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
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

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    let order = null;
    if (mongoose.isValidObjectId(id)) {
      order = await Order.findByIdAndDelete(id);
    }
    if (!order) {
      order = await Order.findOneAndDelete({ orderNumber: id });
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

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
      data: order,
    });
  } catch (error) {
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
