import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET PUBLIC PRODUCTS
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || searchParams.get("cetagory") || "";
    const brand = searchParams.get("brand") || "";
    const featured = searchParams.get("featured");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit")) || 12, 1),
      100
    );

    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const skip = (page - 1) * limit;

    const filter = {
      // By default only show Active products for customers
      status: "Active",
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All Categories" && category !== "All") {
      const escaped = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const terms = category.split(/\s*(?:&|\band\b|,|\/)\s*/i).map((t) => t.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).filter(Boolean);
      
      const orConditions = [{ category: { $regex: `^${escaped}$`, $options: "i" } }];
      terms.forEach((term) => {
        orConditions.push({ category: { $regex: `^${term}$`, $options: "i" } });
      });

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: orConditions }
        ];
        delete filter.$or;
      } else {
        filter.$or = orConditions;
      }
    }

    if (brand && brand !== "All Brands" && brand !== "All") {
      filter.brand = { $regex: `^${brand}$`, $options: "i" };
    }

    if (featured !== null && featured !== undefined && featured !== "") {
      filter.featured = featured === "true";
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort options
    let sortQuery = { createdAt: -1 };
    if (sort === "oldest") sortQuery = { createdAt: 1 };
    else if (sort === "price-asc" || sort === "price_asc") sortQuery = { price: 1 };
    else if (sort === "price-desc" || sort === "price_desc") sortQuery = { price: -1 };
    else if (sort === "name-asc") sortQuery = { name: 1 };
    else if (sort === "name-desc") sortQuery = { name: -1 };

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const products = await Product.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: products,
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
    console.error("GET public products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
