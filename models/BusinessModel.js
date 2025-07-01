const mongoose = require("mongoose");
const businessSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  businessName: { type: String, required: true },
  address: {
    state: { type: String, required: true },
    district: { type: String, required: true },
    streetAddress: { type: String, required: true },
  },
  image: { type: mongoose.Schema.Types.Mixed },
  contactNumber: { type: Number, required: true },
  email: { type: String, required: false },
  branches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  ],
});

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
