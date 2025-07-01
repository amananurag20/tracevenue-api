const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    table_name: {
      type: String,
      required: true,
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    orderType: {
      type: String,
      enum: ["dine-in", "pick-up", "delivery"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired"], // Assuming statuses can include more options
      default: "active",
    },
    group: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const QRCode = mongoose.model("QRCode", qrCodeSchema);

module.exports = QRCode;
