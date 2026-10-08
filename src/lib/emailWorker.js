import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import EmailJob from "@/models/EmailJob";
import EmailLog from "@/models/EmailLog";
import Setting from "@/models/Setting";

let isWorkerRunning = false;

/**
 * Resolves nodemailer transporter using database mail settings or environment variables
 */
export async function getTransporter(explicitSettings = null) {
  let mailConfig = explicitSettings?.mail;

  if (!mailConfig || !mailConfig.host) {
    try {
      await connectDB();
      const settingsDoc = await Setting.findOne({ key: "general_settings" }).lean();
      mailConfig = settingsDoc?.mail;
    } catch (err) {
      console.error("[EmailWorker] Error fetching mail settings:", err);
    }
  }

  const host = mailConfig?.host || process.env.SMTP_HOST || "";
  const port = Number(mailConfig?.port || process.env.SMTP_PORT || 587);
  const user = mailConfig?.username || process.env.SMTP_USER || "";
  const pass = mailConfig?.password || process.env.SMTP_PASS || "";
  const secure = port === 465;

  if (!host || !user) {
    return {
      transporter: null,
      fromAddress: mailConfig?.fromEmail || "support@eflix.store",
      fromName: mailConfig?.fromName || "Eflix",
      isConfigured: false,
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    // Production timeouts
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return {
    transporter,
    fromAddress: mailConfig?.fromEmail || user,
    fromName: mailConfig?.fromName || "Eflix",
    isConfigured: true,
  };
}

/**
 * Enqueue a single email job into the persistent queue
 */
export async function enqueueEmailJob({
  type,
  recipient,
  recipientName = "",
  subject,
  html,
  text = "",
  data = {},
  scheduledAt = new Date(),
}) {
  await connectDB();

  const job = await EmailJob.create({
    type,
    recipient: recipient.toLowerCase().trim(),
    recipientName,
    subject,
    html,
    text: text || html.replace(/<[^>]*>?/gm, " ").substring(0, 300),
    data,
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    scheduledAt,
  });

  // Asynchronously trigger background queue processing
  triggerEmailWorker();

  return job;
}

/**
 * Enqueue multiple email jobs into the queue
 */
export async function enqueueMultipleEmailJobs(jobs) {
  if (!Array.isArray(jobs) || jobs.length === 0) return [];

  await connectDB();

  const docs = jobs.map((j) => ({
    type: j.type,
    recipient: j.recipient.toLowerCase().trim(),
    recipientName: j.recipientName || "",
    subject: j.subject,
    html: j.html,
    text: j.text || (j.html ? j.html.replace(/<[^>]*>?/gm, " ").substring(0, 300) : ""),
    data: j.data || {},
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    scheduledAt: j.scheduledAt || new Date(),
  }));

  const createdJobs = await EmailJob.insertMany(docs);

  triggerEmailWorker();

  return createdJobs;
}

/**
 * Non-blocking trigger to run the worker in the background
 */
export function triggerEmailWorker() {
  // Use setImmediate to release the current execution cycle
  setImmediate(() => {
    processEmailQueue().catch((err) => {
      console.error("[EmailWorker] Background processing error:", err);
    });
  });
}

/**
 * Worker process that claims and dispatches pending email jobs
 */
export async function processEmailQueue() {
  if (isWorkerRunning) {
    return { status: "already_running" };
  }

  isWorkerRunning = true;
  let processedCount = 0;
  let successCount = 0;
  let failureCount = 0;

  try {
    await connectDB();
    const settingsDoc = await Setting.findOne({ key: "general_settings" }).lean();
    const { transporter, fromAddress, fromName, isConfigured } =
      await getTransporter(settingsDoc);

    const fromHeader = `"${fromName}" <${fromAddress}>`;

    // Process jobs until no pending jobs remain in this cycle (batch limit 50)
    while (processedCount < 50) {
      // Atomically claim the next pending job
      const now = new Date();
      const job = await EmailJob.findOneAndUpdate(
        {
          status: "pending",
          scheduledAt: { $lte: now },
          attempts: { $lt: 3 },
        },
        {
          $set: {
            status: "processing",
            lockedAt: now,
          },
          $inc: { attempts: 1 },
        },
        {
          sort: { scheduledAt: 1, createdAt: 1 },
          new: true,
        }
      );

      // No more jobs ready to process
      if (!job) {
        break;
      }

      processedCount++;

      try {
        if (!isConfigured || !transporter) {
          throw new Error(
            "SMTP is not configured in Admin Settings. Please set host, username, and password."
          );
        }

        // Send mail via nodemailer
        const info = await transporter.sendMail({
          from: fromHeader,
          to: job.recipient,
          subject: job.subject,
          html: job.html,
          text: job.text,
        });

        // Mark completed
        await EmailJob.updateOne(
          { _id: job._id },
          {
            $set: {
              status: "completed",
              completedAt: new Date(),
              lastError: "",
            },
          }
        );

        // Record in EmailLog
        await EmailLog.create({
          type: "email",
          recipientType: job.type.includes("admin")
            ? "admin_notification"
            : job.type.includes("order")
            ? "order_confirmation"
            : "subscriber_broadcast",
          recipients: [job.recipient],
          recipientCount: 1,
          subject: job.subject,
          html: job.html,
          status: "sent",
        });

        successCount++;

        // Rate-limit safety pause (1 second) to prevent SMTP 550 Too many emails per second errors
        await new Promise((resolve) => setTimeout(resolve, 1100));
      } catch (sendError) {
        failureCount++;
        const errorMessage = sendError.message || "Failed to dispatch email";
        console.error(`[EmailWorker] Failed job ${job._id} to ${job.recipient}:`, errorMessage);

        const isFinalAttempt = job.attempts >= job.maxAttempts;
        const backoffMinutes = job.attempts === 1 ? 1 : 5; // Exponential backoff
        const nextSchedule = new Date(Date.now() + backoffMinutes * 60 * 1000);

        await EmailJob.updateOne(
          { _id: job._id },
          {
            $set: {
              status: isFinalAttempt ? "failed" : "pending",
              scheduledAt: isFinalAttempt ? job.scheduledAt : nextSchedule,
              lastError: errorMessage,
            },
          }
        );

        // Record failure in EmailLog
        await EmailLog.create({
          type: "email",
          recipientType: job.type,
          recipients: [job.recipient],
          recipientCount: 1,
          subject: job.subject,
          html: job.html,
          status: "failed",
          error: errorMessage,
        });
      }
    }
  } catch (error) {
    console.error("[EmailWorker] Queue execution error:", error);
  } finally {
    isWorkerRunning = false;
  }

  return {
    processed: processedCount,
    succeeded: successCount,
    failed: failureCount,
  };
}
