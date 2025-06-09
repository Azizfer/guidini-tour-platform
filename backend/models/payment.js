// models/Payment.js
const mongoose = require('mongoose');

// Import required models
let Tour, GuideStats;
// Use a function to avoid circular dependencies
const getModels = () => {
  if (!Tour) Tour = require('./Tour');
  if (!GuideStats) GuideStats = require('./GuideStats');
  return { Tour, GuideStats };
};

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
    enum: ['completed'],
    default: 'completed'
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

// Store guide ID for post-save hook
PaymentSchema.statics.guideIdCache = new Map();

// Pre-save hook to update guide stats when a payment is completed
PaymentSchema.pre('save', async function(next) {
  try {
    console.log('DEBUG: Payment pre-save hook triggered with status:', this.status);
    console.log('DEBUG: Payment tourId in pre-save hook:', this.tourId);
    console.log('DEBUG: Is this a new payment?', this.isNew);
    
    // Only proceed if the payment status is 'completed'
    if (this.status === 'completed') {
      console.log('DEBUG: Payment pre-save hook processing completed payment:', this.paymentRef);
      
      // Skip if no tourId is available
      if (!this.tourId || this.tourId === 'unknown') {
        console.log('No valid tourId found, skipping guide stats update');
        return next();
      }
      
      // Get the required models
      const { Tour, GuideStats } = getModels();
      
      // Find the tour to get the guide ID
      const tour = await Tour.findById(this.tourId);
      if (!tour || !tour.guideId) {
        console.log('No tour or guideId found, skipping guide stats update');
        return next();
      }
      
      const guideId = tour.guideId;
      console.log('Found guide ID for stats update:', guideId);
      
      // Store guideId for post-save hook
      PaymentSchema.statics.guideIdCache.set(this._id.toString(), guideId);
      
      // Find or create stats document for this guide
      let stats = await GuideStats.findOne({ guideId });
      if (!stats) {
        console.log('Creating new GuideStats document for guide:', guideId);
        stats = new GuideStats({ guideId });
      }
      
      // Check if this is a new payment or an update
      const isNew = this.isNew;
      
      // Only increment if this is a new payment or status changed to completed
      if (isNew || this.isModified('status')) {
        console.log('Incrementing paymentsReceived count for guide:', guideId);
        // Increment paymentsReceived count
        stats.paymentsReceived += 1;
        
        // Increment tourists count based on participants
        if (this.participants) {
          stats.touristsCount += this.participants;
        }
        
        // Also increment revenue if amount is available
        if (this.amount) {
          stats.totalRevenue += this.amount;
        }
        
        // Save the updated stats
        await stats.save();
        console.log(`Updated guide stats: paymentsReceived=${stats.paymentsReceived}, touristsCount=${stats.touristsCount}, revenue=${stats.totalRevenue}`);
      }
    }
    next();
  } catch (error) {
    console.error('Error in payment pre-save hook:', error);
    // Don't block the payment save operation if stats update fails
    next();
  }
});

// Post-save hook to emit socket events
PaymentSchema.post('save', async function() {
  try {
    if (this.status === 'completed') {
      // Get the guide ID from cache or find it again
      let guideId = PaymentSchema.statics.guideIdCache.get(this._id.toString());
      
      if (!guideId && this.tourId && this.tourId !== 'unknown') {
        // If not in cache, try to find it again
        const { Tour } = getModels();
        const tour = await Tour.findById(this.tourId);
        if (tour && tour.guideId) {
          guideId = tour.guideId;
        }
      }
      
      if (guideId) {
        // Socket.io events removed
        console.log('Reservation completed for guide:', guideId);
        
        // Clean up cache
        PaymentSchema.statics.guideIdCache.delete(this._id.toString());
      }
    }
  } catch (error) {
    console.error('Error in payment post-save hook:', error);
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);