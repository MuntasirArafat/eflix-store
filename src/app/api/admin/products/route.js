import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

// GET PRODUCTS
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";

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

    // Search by name, slug, or sku
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status (ignore "All Status")
    if (status && status !== "All Status") {
      filter.status = { $regex: `^${status}$`, $options: "i" };
    }

    // Filter by category (ignore "All Categories")
    if (category && category !== "All Categories") {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    // Get total count
    const total = await Product.countDocuments(filter);

    // Calculate pagination
    const totalPages = Math.ceil(total / limit) || 1;

    // Get products
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
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
    console.error("GET products error:", error);

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

// CREATE PRODUCT
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      name,
      slug,
      sku,
      category,
      brand,
      description,
      price,
      comparePrice,
      stock,
      status,
      featured,
      showInMenu,
      image,
      attributes,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name and slug are required",
        },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || Number(price) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid product price is required",
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const cleanSlug = slug.toLowerCase().trim();
    const existingProduct = await Product.findOne({ slug: cleanSlug });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product with this slug already exists",
        },
        { status: 409 }
      );
    }

    const cleanAttributes = Array.isArray(attributes)
      ? attributes
          .filter((attr) => attr && attr.name && attr.name.trim())
          .map((attr) => ({
            name: attr.name.trim(),
            options: Array.isArray(attr.options)
              ? attr.options
                  .filter((opt) => opt && (typeof opt === "string" ? opt.trim() : opt.label?.trim()))
                  .map((opt) => {
                    if (typeof opt === "string") {
                      return { label: opt.trim(), price: null };
                    }
                    return {
                      label: opt.label.trim(),
                      price:
                        opt.price !== undefined && opt.price !== "" && opt.price !== null
                          ? Number(opt.price)
                          : null,
                    };
                  })
              : [],
          }))
      : [];

    const product = await Product.create({
      name: name.trim(),
      slug: cleanSlug,
      sku: sku ? sku.trim() : "",
      category: category.trim(),
      brand: brand ? brand.trim() : "",
      description: description || "",
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      stock: stock !== undefined && stock !== "" ? Number(stock) : 0,
      status: status || "Active",
      featured: Boolean(featured),
      showInMenu: showInMenu !== undefined ? Boolean(showInMenu) : true,
      image: image || "",
      attributes: cleanAttributes,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// UPDATE PRODUCT
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      id,
      name,
      slug,
      sku,
      category,
      brand,
      description,
      price,
      comparePrice,
      stock,
      status,
      featured,
      showInMenu,
      image,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    // Check slug collision
    if (slug) {
      const cleanSlug = slug.toLowerCase().trim();
      if (cleanSlug !== product.slug) {
        const existing = await Product.findOne({
          slug: cleanSlug,
          _id: { $ne: id },
        });

        if (existing) {
          return NextResponse.json(
            {
              success: false,
              message: "Product with this slug already exists",
            },
            { status: 409 }
          );
        }
        product.slug = cleanSlug;
      }
    }

    if (name !== undefined) product.name = name.trim();
    if (sku !== undefined) product.sku = sku.trim();
    if (category !== undefined) product.category = category.trim();
    if (brand !== undefined) product.brand = brand.trim();
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (comparePrice !== undefined)
      product.comparePrice = comparePrice ? Number(comparePrice) : null;
    if (stock !== undefined) product.stock = Number(stock);
    if (status !== undefined) product.status = status;
    if (featured !== undefined) product.featured = Boolean(featured);
    if (showInMenu !== undefined) product.showInMenu = Boolean(showInMenu);
    if (image !== undefined) product.image = image;

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE PRODUCT
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
