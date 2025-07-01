const { Schema, default: mongoose } = require("mongoose");

const transactionSchema = new Schema(
  {
    transactionId: String,
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    totalAmount: Number,
    paymentMethod: String,
    paid: { type: Number },
    wavedOff: { type: Number },
    tip: { type: Number },
    settlementAmount: { type: Number },
    due: { type: Number },
    discount: { type: Schema.Types.Mixed },
    discountType: { type: String },
    type: {
      type: String,
      enum: ["paid", "due"],
      required: true,
      default: "paid",
    },
    user_id: { type: Schema.Types.ObjectId, ref: "Users", required: false },
    restaurant_id: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
