import mongoose from "mongoose";

const TrafficSchema = new mongoose.Schema(
  {
    date: {
      type: String, // "YYYY-MM-DD" e.g. "2026-10-08"
      required: true,
      index: true,
    },
    hour: {
      type: Number, // 0..23
      required: true,
      min: 0,
      max: 23,
    },
    pageViews: {
      type: Number,
      default: 0,
    },
    visitors: {
      type: Number,
      default: 0,
    },
    ips: {
      type: [String],
      default: [],
    },
    // Unique visitor keys: "v:<browserId>" or "ip:<ip>" fallback
    visitorIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

TrafficSchema.index({ date: 1, hour: 1 }, { unique: true });

if (
  mongoose.models.Traffic &&
  (!mongoose.models.Traffic.schema.paths.date ||
    !mongoose.models.Traffic.schema.paths.visitorIds)
) {
  delete mongoose.models.Traffic;
}

const Traffic =
  mongoose.models.Traffic || mongoose.model("Traffic", TrafficSchema);

export default Traffic;
