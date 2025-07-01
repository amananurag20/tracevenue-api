const mongoose = require("mongoose");
const notificationUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: { type: String, required: true },
  notification_token: { type: String, required: true },
});
const notificationUser = mongoose.model(
  "notificationUser",
  notificationUserSchema
);
module.exports = notificationUser;
