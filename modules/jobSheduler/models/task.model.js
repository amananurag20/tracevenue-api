const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  taskType: {
    type: String,
    enum: ['autoApply', 'other'],
    default: 'other'
  },
  taskData: {
    delay: Number,
    minMatchPercentage: Number,
    visibility: String
  },
  lastExecutedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt timestamp before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 