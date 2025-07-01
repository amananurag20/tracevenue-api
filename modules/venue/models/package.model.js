const mongoose = require("mongoose");
const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variants",
      },
    ],
    eventType: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Events",
      },
    ]
  },
  {
    timestamps: true,
  }
);

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
