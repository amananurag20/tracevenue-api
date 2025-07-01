const mongoose = require("mongoose");
const jobContractSchema = new mongoose.Schema(
  {
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true,
    },
    venue_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    extra_requirements: {
      type: [],
      default: [],
    },
    status: {
      type: String,
      enum: ["Under Review", "Approved", "Rejected", "Pending", "Completed"],
      default: "Pending",
    },
    rating: {
      type: Number,
      default: null,
    },
    review: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);
module.exports = mongoose.model("JobContract", jobContractSchema);
