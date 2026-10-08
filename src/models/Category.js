import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    show_section: {
      type: Boolean,
      default: false,
    },

    is_menu: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Category && !mongoose.models.Category.schema.paths.show_section) {
  delete mongoose.models.Category;
}

const Category =
  mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);

export default Category;