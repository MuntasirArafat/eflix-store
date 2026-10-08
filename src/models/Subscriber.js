import mongoose from "mongoose";

const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
    },
    source: {
      type: String,
      enum: ["checkout", "newsletter", "admin", "registration"],
      default: "newsletter",
    },
    ordersCount: {
      type: Number,
      default: 0,
    },
    lastOrderAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Subscriber && !mongoose.models.Subscriber.schema.paths.source) {
  delete mongoose.models.Subscriber;
}

const Subscriber =
  mongoose.models.Subscriber ||
  mongoose.model("Subscriber", SubscriberSchema);

export default Subscriber;
