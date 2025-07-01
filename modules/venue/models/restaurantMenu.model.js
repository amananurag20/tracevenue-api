const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Items = require("./masterMenu.model");
const Restaurant = require("../../../models/RestaurantModels");

// Create the RestaurentMenu schema
const restaurantMenuSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: Restaurant,
      unique: true,
    },
    items: [{ type: Schema.Types.ObjectId, ref: Items }],
    disabledCategories: [String],
    disabledSubCategories: [String],
    disabledItems: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("RestaurantMenu", restaurantMenuSchema);
