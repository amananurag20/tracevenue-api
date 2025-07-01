const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    metadata: {
      type: Map,
      of: String,
      default: new Map(),
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes
mediaSchema.index({ filename: 1 });
mediaSchema.index({ displayName: 'text' });

const Media = mongoose.model("Media", mediaSchema);
module.exports = Media; 