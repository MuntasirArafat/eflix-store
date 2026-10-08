import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    comparePrice: {
      type: Number,
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Draft", "Out of Stock", "Inactive"],
      default: "Active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    showInMenu: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
    attributes: [
      {
        name: { type: String, required: true, trim: true },
        options: [
          {
            label: { type: String, required: true, trim: true },
            price: { type: Number, default: null },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Product && !mongoose.models.Product.schema.paths.attributes) {
  delete mongoose.models.Product;
}

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);

export default Product;
