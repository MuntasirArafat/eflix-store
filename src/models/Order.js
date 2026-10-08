import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1, min: 1 },
  price: { type: Number, required: true, min: 0 },
  deliveryType: { type: String, default: "Digital" },
  image: { type: String, default: "" },
  attributes: { type: mongoose.Schema.Types.Mixed, default: null },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    items: {
      type: Number,
      default: 1,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },
    transactionId: {
      type: String,
      default: "",
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Unpaid"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    products: [OrderItemSchema],
    deliveryNotes: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    coupon: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

if (
  mongoose.models.Order &&
  (!mongoose.models.Order.schema.paths.coupon ||
    !mongoose.models.Order.schema.paths.transactionId)
) {
  delete mongoose.models.Order;
}

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);

export default Order;
