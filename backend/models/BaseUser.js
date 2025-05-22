const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Base schema with common fields for all user types
const baseUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  firstName: {
    type: String,
    trim: true,
    required: false
  },
  lastName: {
    type: String,
    trim: true,
    required: false
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  userType: {
    type: String,
    enum: ['tourist', 'guide'],
    required: true
  },
  languages: {
    type: [String],
    default: []
  },
  profileImage: {
    type: String,
    default: '/placeholder.svg?height=200&width=200'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  discriminatorKey: 'userType',
  collection: 'users'
});

// Add pre-save hook for password hashing if needed
baseUserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
baseUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the base User model
const BaseUser = mongoose.model('User', baseUserSchema);

module.exports = BaseUser;
