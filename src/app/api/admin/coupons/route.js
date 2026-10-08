import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

// GET /api/admin/coupons
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "All";
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit")) || 100, 1), 500);
    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    const total = await Coupon.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const coupons = await Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: coupons,
        coupons,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          perPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET coupons error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch coupons", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupons
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      code,
      description,
      discountType,
      discount,
      minimumPurchase,
      maximumDiscount,
      usageLimit,
      expiryDate,
      status,
    } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (discount === undefined || discount === null || Number(discount) < 0) {
      return NextResponse.json(
        { success: false, message: "A valid discount value is required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    // Check if code already exists
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Coupon with code "${cleanCode}" already exists` },
        { status: 409 }
      );
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      description: description?.trim() || "",
      discountType: discountType === "Fixed" ? "Fixed" : "Percentage",
      discount: Number(discount),
      minimumPurchase: minimumPurchase ? Number(minimumPurchase) : 0,
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : null,
      usageLimit: usageLimit ? Number(usageLimit) : 0,
      used: 0,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: status === "Inactive" ? "Inactive" : "Active",
    });

    return NextResponse.json(
      { success: true, message: "Coupon created successfully", data: coupon },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create coupon", error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/coupons
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      id,
      code,
      description,
      discountType,
      discount,
      minimumPurchase,
      maximumDiscount,
      usageLimit,
      expiryDate,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    if (code) {
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode !== coupon.code) {
        const existing = await Coupon.findOne({ code: cleanCode, _id: { $ne: id } });
        if (existing) {
          return NextResponse.json(
            { success: false, message: `Coupon with code "${cleanCode}" already exists` },
            { status: 409 }
          );
        }
        coupon.code = cleanCode;
      }
    }

    if (description !== undefined) coupon.description = description.trim();
    if (discountType !== undefined)
      coupon.discountType = discountType === "Fixed" ? "Fixed" : "Percentage";
    if (discount !== undefined) coupon.discount = Number(discount);
    if (minimumPurchase !== undefined)
      coupon.minimumPurchase = minimumPurchase ? Number(minimumPurchase) : 0;
    if (maximumDiscount !== undefined)
      coupon.maximumDiscount = maximumDiscount ? Number(maximumDiscount) : null;
    if (usageLimit !== undefined)
      coupon.usageLimit = usageLimit ? Number(usageLimit) : 0;
    if (expiryDate !== undefined)
      coupon.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (status !== undefined) coupon.status = status;

    await coupon.save();

    return NextResponse.json(
      { success: true, message: "Coupon updated successfully", data: coupon },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update coupon error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update coupon", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/coupons
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Coupon ID is required" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Coupon deleted successfully", data: coupon },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete coupon error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete coupon", error: error.message },
      { status: 500 }
    );
  }
}
