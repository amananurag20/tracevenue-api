const mongoose = require("mongoose");

const ItemTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["FOOD_TYPE", "DRINK_TYPE", "DISH_TYPE"], // Can be expanded as needed
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure unique names within each category
ItemTypeSchema.index({ name: 1, category: 1 }, { unique: true });

const ItemType = mongoose.model("ItemType", ItemTypeSchema);
module.exports = ItemType;
