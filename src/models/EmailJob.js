import mongoose from "mongoose";

const EmailJobSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "order_customer",
        "order_admin",
        "broadcast_subscriber",
        "custom_email",
        "test_email",
      ],
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    recipientName: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    lastError: {
      type: String,
      default: "",
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for queue polling
EmailJobSchema.index({ status: 1, scheduledAt: 1, attempts: 1 });

const EmailJob =
  mongoose.models.EmailJob || mongoose.model("EmailJob", EmailJobSchema);

export default EmailJob;
