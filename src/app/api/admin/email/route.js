import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EmailLog from "@/models/EmailLog";
import Order from "@/models/Order";
import Subscriber from "@/models/Subscriber";
import Setting from "@/models/Setting";
import { enqueueMultipleEmailJobs } from "@/lib/emailWorker";

// GET EMAIL / NOTIFICATION LOGS
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";

    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit")) || 10, 1),
      100
    );

    const page = Math.max(
      parseInt(searchParams.get("page")) || 1,
      1
    );

    const skip = (page - 1) * limit;

    const filter = {};

    if (type && type !== "All") {
      filter.type = type.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const total = await EmailLog.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const logs = await EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Also get count of subscribers
    const subscriberCount = await Subscriber.countDocuments({ status: "active" });
    const customerEmails = await Order.distinct("email");

    return NextResponse.json(
      {
        success: true,
        data: logs,
        stats: {
          subscribers: subscriberCount,
          customerEmailsCount: customerEmails.length,
          totalAudience: Math.max(subscriberCount, customerEmails.length),
        },
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
    console.error("GET email logs error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch email logs",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// SEND EMAIL OR ONESIGNAL NOTIFICATION
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      type = "email",
      recipientType = "all_subscribers",
      recipients = [],
      subject,
      html,
      title,
      message,
      url,
    } = body;

    // Handle OneSignal Push Notification
    if (type === "onesignal") {
      if (!title?.trim() || !message?.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Notification title and message are required",
          },
          { status: 400 }
        );
      }

      // Fetch OneSignal credentials from settings
      const settings = await Setting.findOne({ key: "general_settings" }).lean();
      const appId = settings?.oneSignal?.appId || process.env.ONESIGNAL_APP_ID;
      const restKey =
        settings?.oneSignal?.restApiKey || process.env.ONESIGNAL_REST_API_KEY;

      let oneSignalSuccess = true;
      let errorMsg = "";

      if (appId && restKey) {
        try {
          const osRes = await fetch("https://onesignal.com/api/v1/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${restKey}`,
            },
            body: JSON.stringify({
              app_id: appId,
              included_segments: ["Subscribed Users"],
              headings: { en: title },
              contents: { en: message },
              url: url || undefined,
            }),
          });
          const osData = await osRes.json();
          if (!osRes.ok) {
            errorMsg = osData?.errors?.join?.(", ") || "Failed to dispatch via OneSignal API";
            oneSignalSuccess = false;
          }
        } catch (err) {
          errorMsg = err.message;
          oneSignalSuccess = false;
        }
      }

      const log = await EmailLog.create({
        type: "onesignal",
        recipientType: "all_subscribers",
        title: title.trim(),
        message: message.trim(),
        url: url?.trim() || "",
        status: oneSignalSuccess ? "sent" : "failed",
        error: errorMsg,
      });

      return NextResponse.json(
        {
          success: true,
          message: oneSignalSuccess
            ? "Push notification dispatched successfully"
            : `Notification logged (OneSignal returned: ${errorMsg || "credentials not configured"})`,
          data: log,
        },
        { status: 201 }
      );
    }

    // Handle Email
    if (!subject?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Email subject is required",
        },
        { status: 400 }
      );
    }

    if (!html?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Email content is required",
        },
        { status: 400 }
      );
    }

    let targetEmails = Array.isArray(recipients) ? [...recipients] : [];

    if (recipientType === "all_subscribers") {
      // Gather unique emails from Subscriber collection and Order collection
      const subscribers = await Subscriber.find({ status: "active" }).select("email").lean();
      const customerEmails = await Order.distinct("email");

      const emailSet = new Set([
        ...subscribers.map((s) => s.email.toLowerCase().trim()),
        ...customerEmails.map((e) => e?.toLowerCase?.()?.trim()).filter(Boolean),
      ]);

      targetEmails = Array.from(emailSet);
      if (targetEmails.length === 0) {
        // Fallback placeholder if no subscribers yet
        targetEmails = ["subscribers@store.com"];
      }
    } else {
      targetEmails = targetEmails.filter((e) => Boolean(e) && e.includes("@"));
      if (targetEmails.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No valid recipient emails provided",
          },
          { status: 400 }
        );
      }
    }

    // Create email jobs for each recipient to be dispatched by worker
    const jobs = targetEmails.map((targetEmail) => ({
      type: recipientType === "specific_email" ? "order_delivery" : "broadcast_subscriber",
      recipient: targetEmail,
      recipientName: "",
      subject: subject.trim(),
      html: html.trim(),
      data: {
        recipientType,
        source: recipientType === "specific_email" ? "order_delivery" : "admin_broadcast",
      },
    }));

    await enqueueMultipleEmailJobs(jobs);

    // Create log in database
    const log = await EmailLog.create({
      type: "email",
      recipientType,
      recipients: targetEmails,
      recipientCount: targetEmails.length,
      subject: subject.trim(),
      html: html.trim(),
      status: "sent",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          recipientType === "specific_email"
            ? `Email queued to ${targetEmails.join(", ")} successfully`
            : `Email broadcast queued to ${targetEmails.length} recipient(s) successfully`,
        data: log,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send email / notification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to process email dispatch",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
