// models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // Payment identification
  paymentRef: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true
  },
  
  // User information
  userId: {
    type: String,
    required: false
  },
  
  // Tour/Activity information
  tourId: {
    type: String,
    required: false
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'TND'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Customer information
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  
  // Reservation details
  participants: {
    type: Number,
    default: 1
  },
  reservationDate: Date,
  
  // Payment method information
  paymentMethod: String,
  
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

module.exports = mongoose.model('Payment', PaymentSchema);