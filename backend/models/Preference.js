const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  username: {
    type: String,
    ref: 'User'
  },
  languages: {
    type: [String],
    default: []
  },
  travelPurpose: {
    type: [String],
    default: []
  },
  travelCompanions: {
    type: [String],
    default: []
  },
  budget: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt field
preferenceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Preference', preferenceSchema);
