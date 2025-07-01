const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId },
  receiverId: { type: mongoose.Schema.Types.ObjectId },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  sender: {
    type: String,
    enum: ["user", "restaurant"],
    default: "user",
  },
});

module.exports = mongoose.model("Chat", chatSchema);
