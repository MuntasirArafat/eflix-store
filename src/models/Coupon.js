import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["Percentage", "Fixed"],
      default: "Percentage",
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    used: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Coupon && !mongoose.models.Coupon.schema.paths.code) {
  delete mongoose.models.Coupon;
}

const Coupon =
  mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);

export default Coupon;
