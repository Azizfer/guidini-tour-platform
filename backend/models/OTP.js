const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true,
    enum: ['registration', 'password-reset']
  },
  otp: {
    type: String,
    required: true
  },
  expiryTime: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // TTL index: automatically delete documents after 10 minutes (600 seconds)
  }
});

// Compound index to ensure uniqueness and for faster lookups
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });

module.exports = mongoose.model('OTP', otpSchema);
