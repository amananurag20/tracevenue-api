const mongoose = require('mongoose');

const autoApplyLogSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  matchPercentage: {
    type: Number,
    required: true
  },
  variantsApplied: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variant'
  }],
  errorMessage: {
    type: String
  },
  taskData: {
    delay: Number,
    minMatchPercentage: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
autoApplyLogSchema.index({ restaurantId: 1, createdAt: -1 });
autoApplyLogSchema.index({ jobId: 1, createdAt: -1 });

const AutoApplyLog = mongoose.model('AutoApplyLog', autoApplyLogSchema);

module.exports = AutoApplyLog; 