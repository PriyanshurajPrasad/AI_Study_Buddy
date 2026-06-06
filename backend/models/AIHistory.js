const mongoose = require('mongoose');

const AIHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['explanation', 'doubt'],
    required: true
  },
  query: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
AIHistorySchema.index({ userId: 1, createdAt: -1 });
AIHistorySchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('AIHistory', AIHistorySchema);
