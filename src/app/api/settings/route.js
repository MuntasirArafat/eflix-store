import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/Setting";

// GET PUBLIC SETTINGS
export async function GET() {
  try {
    await connectDB();

    const setting =
      (await Setting.findOne({ key: "general_settings" }).lean()) ||
      (await Setting.findOne({ key: "global_settings" }).lean()) ||
      (await Setting.findOne().lean());

    return NextResponse.json(
      {
        success: true,
        data: {
          whatsapp: {
            enabled: setting?.whatsapp?.enabled ?? true,
            number:
              setting?.whatsapp?.number ||
              setting?.whatsapp?.phoneNumber ||
              "8801711426565",
            phoneNumber:
              setting?.whatsapp?.number ||
              setting?.whatsapp?.phoneNumber ||
              "8801711426565",
            message: setting?.whatsapp?.message || "Hello, I need some help.",
          },
          social: setting?.social || {},
          maintenance: setting?.maintenance || { enabled: false },
          payments: {
            bkash: {
              enabled: setting?.payments?.bkash?.enabled ?? true,
              number: setting?.payments?.bkash?.number || "01711426565",
              type: setting?.payments?.bkash?.type || "Personal",
            },
            nagad: {
              enabled: setting?.payments?.nagad?.enabled ?? true,
              number: setting?.payments?.nagad?.number || "01711426565",
              type: setting?.payments?.nagad?.type || "Personal",
            },
            rocket: {
              enabled: setting?.payments?.rocket?.enabled ?? true,
              number: setting?.payments?.rocket?.number || "01711426565",
              type: setting?.payments?.rocket?.type || "Personal",
            },
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET public settings error:", error);

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
