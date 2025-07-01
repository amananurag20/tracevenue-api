const mongoose = require("mongoose");

const FoodItemAddOnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,

  foodItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,  
  },

  choices: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      isAvailable: { type: Boolean },
    },
  ],
  maxChoices: {
    type: Number,
    required: true,
  },

  veg: {
    type: String,
    enum: ["egg", "veg", "non-veg"],
    required: true,
  },
});

module.exports = mongoose.model("FoodItemAddOn", FoodItemAddOnSchema);
