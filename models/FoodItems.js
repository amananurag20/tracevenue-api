const mongoose = require("mongoose");

const FoodItemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  foodType: {
    type: String,
    required: false,
  },
  quantityAddOn: {
    type: Array,
    required: false,
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  category: {
    type: Object,
    required: true,
  },
  miscellaneous: {
    type: Array,
    required: false,
  },
  isResFav: {
    type: Boolean,
    required: true,
  },
  tags: {
    type: Array,
    required: false,
  },
  foodItemsAddOn_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItemAddOn",
      required: false,
    },
  ],
  available: {
    type: Boolean,
    default: true,
  },
  taxable: {
    type: Boolean,
    default: true
  },
  tax: {
    cgst: { type: String, default: 0 },
    sgst: { type: String, default: 0 },
  },
  taxableAmount: { type: Number, default: 0 },
  isDiscountEligible: { type: Boolean, default: true }
});
module.exports = mongoose.model("FoodItems", FoodItemsSchema);
