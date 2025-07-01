const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
    description: {
      type: String,
      required: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    menuItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MasterMenu",
      },
    ],
    minPersons: {
      type: Number,
      required: true,
    },
    maxPersons: {
      type: Number,
      required: true,
    },

    cost: {
      type: Number,
      required: true,
    },
    isCustomized: {
      type: Boolean,
      default: false,
    },
    jobSpecificId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    paidServices: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    freeServices: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    availableMenuCount: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const Variant = mongoose.model("Variant", variantSchema);

module.exports = Variant;
