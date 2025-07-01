const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNo: String,
    orderStatus: {
      type: String,
      // enum: ["InProcess", "Completed", "Cancelled"],
    },
    cancelOrderReason: { type: String, default: "" },
    kot: {
      type: Boolean,
      default: false,
    },
    total: Number,
    orderDate: String,
    orderTime: String,
    items: {
      type: Array,
      required: true,
    },
    tableNumber: String,
    tableName: String,
    restaurant_id: String,
    user_id: {
      type: String,
      required: false,
      default: null,
    },
    paymentDoneByUser: {
      type: Boolean,
    },
    orderType: {
      type: String,
      enum: ["dine-in", "pick-up", "delivery", "online"],
      required: true,
    },

    paymentMode: {
      type: String,
      required: false,
      default: "",
    },
    group: {
      type: String,
      required: false,
      default: "",
    },
    taxes: {
      cgst: { type: Number, required: true, default: 0 },
      sgst: { type: Number, required: true, default: 0 },
    },
    totalWithoutTax: { type: Number, required: true, default: 0 },
    taxableAmount: { type: Number, required: true, default: 0 },
    payment: {
      paid: { type: Number },
      waivedOff: { type: Number },
      waivedOffReason: { type: String },
      tip: { type: Number },
      settlementAmount: { type: Number },
      discount: { type: Number },
      discountType: { type: String },
      roundedOff: { type: Number },
      type: { type: String, enum: ["paid", "due"], default: "paid" },
      due: { type: Number },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.virtual("transactions", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "orders",
});
module.exports = mongoose.model("Order", orderSchema);
