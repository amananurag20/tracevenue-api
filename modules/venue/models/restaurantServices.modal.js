const mongoose = require("mongoose");

const restaurantServicesSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
  ],
});

module.exports = mongoose.model("RestaurantServices", restaurantServicesSchema);
