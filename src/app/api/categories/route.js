import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

// GET PUBLIC CATEGORIES
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const showSection = searchParams.get("show_section");

    const filter = { status: "active" };
    if (showSection === "true") {
      filter.show_section = true;
    }

    const categories = await Category.find(filter).sort({ createdAt: -1 }).lean();

    // Get count of active products per category
    const categoryCounts = await Product.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    categoryCounts.forEach((c) => {
      if (c._id) countMap[c._id.toLowerCase()] = c.count;
    });

    const enriched = categories.map((cat) => ({
      ...cat,
      productCount: countMap[cat.name?.toLowerCase()] || 0,
    }));

    return NextResponse.json(
      {
        success: true,
        data: enriched,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET public categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
