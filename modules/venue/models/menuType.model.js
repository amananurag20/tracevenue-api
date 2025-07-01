const mongoose = require("mongoose");

const MenuTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true } // Example: "À la carte"
});

const MenuType = mongoose.model("MenuType", MenuTypeSchema);
module.exports = MenuType;
