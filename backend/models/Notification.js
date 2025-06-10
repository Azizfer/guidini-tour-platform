const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // User who will receive the notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Title of the notification
  title: {
    type: String,
    required: true
  },
  // Detailed description
  description: {
    type: String,
    required: true
  },
  // Type of notification
  type: {
    type: String,
    enum: ['booking', 'payment', 'review', 'system', 'reservation', 'booking_confirmation', 'booking_cancellation', 'group_invite'],
    required: true
  },
  // Whether the notification has been read
  read: {
    type: Boolean,
    default: false
  },
  // Optional related entities
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour'
  },
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Optional payment amount
  amount: {
    type: Number
  },
  // Payment reference to link notifications uniquely to a payment
  paymentRef: {
    type: String
  },
  // Optional avatar URL
  avatar: {
    type: String
  },
  // Creation timestamp
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for faster querying by recipient
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Add compound index to prevent duplicate notifications within a short time period
notificationSchema.index({ 
  recipient: 1, 
  type: 1, 
  tourId: 1, 
  createdAt: 1 
}, { 
  unique: true,
  partialFilterExpression: { tourId: { $exists: true } }
});

// Ensure one notification per recipient / type / paymentRef
notificationSchema.index({ recipient: 1, type: 1, paymentRef: 1 }, { unique: true, sparse: true });

// Check if the model already exists before creating it
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;
