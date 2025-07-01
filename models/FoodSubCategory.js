const mongoose = require("mongoose");

const FoodSubCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodCategory",
    required: true,
  },
});

const FoodSubCategory = mongoose.model(
  "FoodSubCategory",
  FoodSubCategorySchema
);
module.exports = FoodSubCategory;
