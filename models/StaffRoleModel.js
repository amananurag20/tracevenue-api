const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true,
  },
  staffType: {
    type: String,
    required: true,
  },
});

const Staff = mongoose.model("Staff", staffSchema);
module.exports = Staff;
