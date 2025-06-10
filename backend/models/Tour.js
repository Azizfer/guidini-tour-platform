const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 1
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  tourStatus: {
    type: String,
    enum: ['active', 'completed', 'private'],
    default: 'active'
  },
  image: {
    type: String,
    default: ''
  },
  bookings: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Histoire', 'Culture', 'Aventure', 'Gastronomie', 'Nature']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tour', tourSchema);
