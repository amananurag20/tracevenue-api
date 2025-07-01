const mongoose = require("mongoose");

const FoodCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  catID: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
  },
  subCategory: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodSubCategory",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
  ],
});

const FoodCategory = mongoose.model("FoodCategory", FoodCategorySchema);
module.exports = FoodCategory;
