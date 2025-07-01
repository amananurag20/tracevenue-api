const mongoose = require("mongoose");

const CuisineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Cuisine = mongoose.model("Cuisine", CuisineSchema);
module.exports = Cuisine;
