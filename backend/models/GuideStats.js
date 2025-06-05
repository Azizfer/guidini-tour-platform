const mongoose = require('mongoose');

/**
 * Schema for tracking guide statistics
 * This is a separate model from Guide to allow for more efficient updates
 * and to avoid having to update the Guide document every time stats change
 */
const guideStatsSchema = new mongoose.Schema({
  // Reference to the guide
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: true,
    unique: true
  },
  
  // Tour statistics
  activeTours: {
    type: Number,
    default: 0,
    min: 0
  },
  
  privateTours: {
    type: Number,
    default: 0,
    min: 0
  },
  
  completedTours: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Booking statistics
  reservations: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Financial statistics
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Tourist statistics
  touristsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Payment statistics
  paymentsReceived: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Rating statistics
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Timestamp for last update
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// The guideId field already has unique: true which creates an index

// Pre-save hook
guideStatsSchema.pre('save', function(next) {
  next();
});

// Create the model
const GuideStats = mongoose.model('GuideStats', guideStatsSchema);

module.exports = GuideStats;
