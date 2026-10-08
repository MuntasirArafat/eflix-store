import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Traffic from "@/models/Traffic";

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request) {
  try {
    await connectDB();

    // Read visitor ID sent by the client tracker
    let visitorId = null;
    try {
      const text = await request.text();
      if (text) {
        const body = JSON.parse(text);
        if (typeof body?.visitorId === "string" && body.visitorId.length <= 100) {
          visitorId = body.visitorId;
        }
      }
    } catch (e) {
      // Ignore malformed body
    }

    const ip = getClientIp(request);
    // Prefer the per-browser ID; fall back to IP when unavailable
    const visitorKey = visitorId ? `v:${visitorId}` : `ip:${ip}`;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const hour = now.getHours(); // 0..23

    // Atomically increment page views and add unique visitor/IP to sets
    const result = await Traffic.findOneAndUpdate(
      { date: dateStr, hour },
      {
        $inc: { pageViews: 1 },
        $addToSet: { ips: ip, visitorIds: visitorKey },
      },
      { upsert: true, new: true }
    );

    // Keep visitors count in sync with unique visitor IDs
    if (result && result.visitorIds && result.visitors !== result.visitorIds.length) {
      result.visitors = result.visitorIds.length;
      await result.save();
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Non-blocking for tracking
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
