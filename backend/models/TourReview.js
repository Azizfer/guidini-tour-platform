const mongoose = require('mongoose');

const tourReviewSchema = new mongoose.Schema({
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  message: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Un utilisateur ne peut laisser qu'un seul avis par tour
tourReviewSchema.index({ tourId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('TourReview', tourReviewSchema);
