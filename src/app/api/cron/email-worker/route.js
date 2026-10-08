import { NextResponse } from "next/server";
import { processEmailQueue } from "@/lib/emailWorker";

export const dynamic = "force-dynamic";

/**
 * Endpoint for cron jobs or external schedulers to process pending email jobs
 */
export async function GET() {
  try {
    const result = await processEmailQueue();
    return NextResponse.json({
      success: true,
      message: "Email queue worker processed successfully",
      stats: result,
    });
  } catch (error) {
    console.error("[EmailWorker Cron] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process email queue",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
