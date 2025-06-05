const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  // Tour information
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: true
  },
  tourName: {
    type: String,
    required: true
  },
  
  // Guide information
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: false // Prevent automatic index creation since we define it explicitly below
  },
  
  // Tourist information
  touristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  touristName: {
    type: String,
    required: true
  },
  touristEmail: {
    type: String,
    required: false
  },
  touristPhone: {
    type: String,
    required: false
  },
  
  // Reservation details
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: false
  },
  participants: {
    type: Number,
    required: true,
    default: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  
  // Payment information
  paymentRef: {
    type: String,
    required: false
  },
  
  // Status: pending, confirmed, completed, cancelled
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for faster querying
reservationSchema.index({ guideId: 1, createdAt: -1 });
reservationSchema.index({ touristId: 1, createdAt: -1 });
reservationSchema.index({ tourId: 1 });
reservationSchema.index({ status: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
