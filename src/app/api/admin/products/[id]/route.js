import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product",
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

    if (body.slug && body.slug !== product.slug) {
      const existing = await Product.findOne({
        slug: body.slug.toLowerCase().trim(),
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
      product.slug = body.slug.toLowerCase().trim();
    }

    if (body.name !== undefined) product.name = body.name.trim();
    if (body.sku !== undefined) product.sku = body.sku.trim();
    if (body.category !== undefined) product.category = body.category.trim();
    if (body.brand !== undefined) product.brand = body.brand.trim();
    if (body.description !== undefined) product.description = body.description;
    if (body.price !== undefined) product.price = Number(body.price);
    if (body.comparePrice !== undefined)
      product.comparePrice = body.comparePrice ? Number(body.comparePrice) : null;
    if (body.stock !== undefined) product.stock = Number(body.stock);
    if (body.status !== undefined) product.status = body.status;
    if (body.featured !== undefined) product.featured = Boolean(body.featured);
    if (body.showInMenu !== undefined)
      product.showInMenu = Boolean(body.showInMenu);
    if (body.image !== undefined) product.image = body.image;
    if (body.attributes !== undefined) {
      product.attributes = Array.isArray(body.attributes)
        ? body.attributes
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
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
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

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

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
