const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    from_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    to_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    notification_title: {
      type: String,
    },
    notification_message: {
      type: String,
      required: true,
    },
    action_link: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Allows storing extra dynamic data
      default: {},
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, strict: false }
);

// Indexing for better performance
notificationSchema.index({ to_ids: 1, seen: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
