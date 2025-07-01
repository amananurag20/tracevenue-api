const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    keywords: [
      {
        word: { type: String, required: true },
        synonyms: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Events = mongoose.model('Events', eventSchema);

module.exports = Events;
