import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";


// GET CATEGORIES
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

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

    // Search by name or slug
    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          slug: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Get total count
    const total = await Category.countDocuments(filter);

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);

    // Get categories
    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: categories,

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
    console.error("GET categories error:", error);

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

// CREATE CATEGORY
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { name, slug, status, show_section, showSection, is_menu } = body;

    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and slug are required",
        },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category with this slug already exists",
        },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name,
      slug,
      status: status || "active",
      show_section: Boolean(show_section ?? showSection ?? false),
      is_menu: is_menu ?? false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create category",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// UPDATE CATEGORY
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();

    const { id, name, slug, status, show_section, showSection, is_menu } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required",
        },
        { status: 400 }
      );
    }

    // Check category exists
    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    // Check slug belongs to another category
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({
        slug,
        _id: { $ne: id },
      });

      if (existingCategory) {
        return NextResponse.json(
          {
            success: false,
            message: "Category with this slug already exists",
          },
          { status: 409 }
        );
      }
    }

    if (name !== undefined) category.name = name;
    if (slug !== undefined) category.slug = slug;
    if (status !== undefined) category.status = status;
    if (show_section !== undefined) category.show_section = Boolean(show_section);
    else if (showSection !== undefined) category.show_section = Boolean(showSection);
    if (is_menu !== undefined) category.is_menu = is_menu;

    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update category",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE CATEGORY
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Category ID is required",
        },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete category",
        error: error.message,
      },
      { status: 500 }
    );
  }
}