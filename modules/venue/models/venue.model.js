const mongoose = require("mongoose");
const package = require("./package.model");
const { VENUE_TYPE } = require("../constants");

const VenueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contact: { type: String, required: true, unique: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    venueType: {
      type: String,
      enum: Object.values(VENUE_TYPE),
      required: true,
    },

    features: { type: [String], required: false },
    packageId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: package,
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Venue", VenueSchema);
