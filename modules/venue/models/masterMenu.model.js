const mongoose = require("mongoose");
const { FOOD_TYPES, DRINK_TYPE } = require("../constants");

const MasterMenuSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    foodType: {
      type: String,
      enum: Object.values(FOOD_TYPES),
      required: function () {
        return !this.drinkType && !this.itemTypes.length;
      },
    },
    drinkType: {
      type: String,
      enum: Object.values(DRINK_TYPE),
      required: function () {
        return !this.foodType && !this.itemTypes.length;
      },
    },
    itemTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ItemType",
      },
    ],
    category: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    ], // Multiple categories
    cuisine: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Cuisine", required: false },
    ], // Multiple cuisines
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Update validation to check either old or new system is used
MasterMenuSchema.pre("save", function (next) {
  if (!this.foodType && !this.drinkType && !this.itemTypes.length) {
    next(new Error("Either foodType/drinkType or itemTypes must be specified"));
  }
  next();
});

const MasterMenu = mongoose.model("MasterMenu", MasterMenuSchema);
module.exports = MasterMenu;
