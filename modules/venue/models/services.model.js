const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    serviceCategory: {
      type: String,
      required: true,
    },
    serviceIcon: {
      type: String,
      required: false,
    },
    archive: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;
