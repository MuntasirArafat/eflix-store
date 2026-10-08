import mongoose from "mongoose";

const EmailLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["email", "onesignal"],
      default: "email",
    },
    recipientType: {
      type: String,
      default: "all_subscribers",
    },
    recipients: {
      type: [String],
      default: [],
    },
    recipientCount: {
      type: Number,
      default: 0,
    },
    subject: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    html: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "sent",
    },
    error: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const EmailLog =
  mongoose.models.EmailLog ||
  mongoose.model("EmailLog", EmailLogSchema);

export default EmailLog;
