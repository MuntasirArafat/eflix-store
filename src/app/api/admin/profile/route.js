import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { getAdminSession } from "@/lib/auth";

// GET ADMIN PROFILE
export async function GET(request) {
  try {
    await connectDB();

    const session = await getAdminSession(request);

    let admin = null;
    if (session?.id) {
      admin = await Admin.findById(session.id).select("-password").lean();
    }

    if (!admin && session?.email) {
      admin = await Admin.findOne({ email: session.email }).select("-password").lean();
    }

    // Fallback to first admin in system if not found
    if (!admin) {
      admin = await Admin.findOne().select("-password").lean();
    }

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin account not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          createdAt: admin.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET admin profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// UPDATE ADMIN PROFILE
export async function PUT(request) {
  try {
    await connectDB();

    const session = await getAdminSession(request);
    const body = await request.json();
    const { name, email } = body;

    let admin = null;
    if (session?.id) {
      admin = await Admin.findById(session.id);
    }
    if (!admin) {
      admin = await Admin.findOne();
    }

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
        },
        { status: 404 }
      );
    }

    if (name) admin.name = name.trim();

    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail !== admin.email) {
        const existing = await Admin.findOne({
          email: cleanEmail,
          _id: { $ne: admin._id },
        });

        if (existing) {
          return NextResponse.json(
            {
              success: false,
              message: "An admin with this email already exists",
            },
            { status: 409 }
          );
        }
        admin.email = cleanEmail;
      }
    }

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
