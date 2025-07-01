const mongoose = require("mongoose");
const moment = require("moment-timezone");
const reviewSchema = new mongoose.Schema({
  restaurant_id: {
    type: String,
    required: true,
  },
  userName: { type: String, required: true },
  rating: { type: Number, required: true },
  review: { type: String, required: false },
  status: { type: Boolean, default: false },
  email: { type: String, required: false },
  date: { type: String, default: currentDate }, // Default to the current date in IST
  time: { type: String, default: currentTime }, // Default to the current time in IST
});
function currentDate() {
  return moment().tz("Asia/Kolkata").startOf("day").format("YYYY-MM-DD"); // IST timezone
}

function currentTime() {
  return moment().tz("Asia/Kolkata").format("HH:mm:ss").toString(); // IST timezone
}
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
