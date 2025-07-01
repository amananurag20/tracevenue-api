const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    hasCuisine: {
      type: Boolean,
      default: false,
    },
    parentCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ], // Array of parent categories
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
