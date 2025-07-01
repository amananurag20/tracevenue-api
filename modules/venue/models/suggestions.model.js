// Mongoose Schema for Keywords
const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  keyword: { type: String, required: true, trim: true },
  // eventType: { type: mongoose.Schema.Types.ObjectId, ref: "EventType" }, // Omitted as per user request
  cuisines: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cuisine" }],
}, {
  timestamps: true // Add timestamps option
});

const Suggestion = mongoose.model('Suggestion', suggestionSchema);
module.exports = Suggestion;