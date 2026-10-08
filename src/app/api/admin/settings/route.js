import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/Setting";

// GET SETTINGS
export async function GET() {
  try {
    await connectDB();

    let settings = await Setting.findOne({ key: "general_settings" }).lean();

    if (!settings) {
      settings = await Setting.create({ key: "general_settings" });
    }

    return NextResponse.json(
      {
        success: true,
        data: settings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch settings",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// UPDATE SETTINGS
export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();

    const updateData = {};

    if (body.mail) updateData.mail = body.mail;
    if (body.oneSignal) updateData.oneSignal = body.oneSignal;
    if (body.payments) updateData.payments = body.payments;
    if (body.maintenance) updateData.maintenance = body.maintenance;
    if (body.social) updateData.social = body.social;
    if (body.whatsapp) updateData.whatsapp = body.whatsapp;
    if (body.imgbb) updateData.imgbb = body.imgbb;

    const settings = await Setting.findOneAndUpdate(
      { key: "general_settings" },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save settings",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
