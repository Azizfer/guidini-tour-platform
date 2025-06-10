const GuideStats = require('../models/GuideStats');
const Tour = require('../models/Tour');
const Rating = require('../models/Rating');
const Payment = require('../models/Payment');

/**
 * Get statistics for a specific guide
 */
exports.getGuideStats = async (req, res) => {
  try {
    const { guideId } = req.params;
    // Try to find existing stats
    let stats = await GuideStats.findOne({ guideId });
    
    // If no stats exist yet, create a new entry with default values
    if (!stats) {
      stats = await GuideStats.create({ guideId });
    }
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching guide stats:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update statistics for a guide when a tour status changes
 * This is the main function that tracks tour status changes
 */
exports.updateTourStatusStats = async (req, res) => {
  try {
    const { guideId } = req.params;
    const { oldStatus, newStatus } = req.body;
    
    if (!guideId || !newStatus) {
      return res.status(400).json({ 
        message: 'Guide ID and new status are required' 
      });
    }
    
    // Find or create stats for this guide
    let stats = await GuideStats.findOne({ guideId });
    if (!stats) {
      stats = await GuideStats.create({ guideId });
    }
    
    // Update based on status changes
    const update = {};
    
    // Handle removing from old status count if it exists
    if (oldStatus) {
      if (oldStatus === 'active' && stats.activeTours > 0) {
        update.activeTours = stats.activeTours - 1;
      } else if (oldStatus === 'private' && stats.privateTours > 0) {
        update.privateTours = stats.privateTours - 1;
      } else if (oldStatus === 'completed' && stats.completedTours > 0) {
        update.completedTours = stats.completedTours - 1;
      }
    }
    
    // Handle adding to new status count
    if (newStatus === 'active') {
      update.activeTours = (stats.activeTours || 0) + 1;
    } else if (newStatus === 'private') {
      update.privateTours = (stats.privateTours || 0) + 1;
    } else if (newStatus === 'completed') {
      update.completedTours = (stats.completedTours || 0) + 1;
    } else if (newStatus === 'deleted') {
      // If a tour is deleted, we don't increment any counters
      // The old status counter was already decremented above
    }
    
    // Update the lastUpdated timestamp
    update.lastUpdated = new Date();
    
    // Update the stats in the database
    const updatedStats = await GuideStats.findOneAndUpdate(
      { guideId },
      { $set: update },
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedStats);
  } catch (error) {
    console.error('Error updating tour status stats:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Calculate and update all stats for a guide
 * This is useful for initializing or refreshing all stats at once
 */
exports.recalculateAllStats = async (req, res) => {
  try {
    const { guideId } = req.params;
    
    // Count tours by status
    const activeTours = await Tour.countDocuments({ 
      guideId, 
      tourStatus: 'active'
    });
    
    const privateTours = await Tour.countDocuments({ 
      guideId, 
      tourStatus: 'private'
    });
    
    const completedTours = await Tour.countDocuments({ 
      guideId, 
      tourStatus: 'completed'
    });
    
    // Calculate total revenue (if price data is available)
    const tours = await Tour.find({ guideId });
    const totalRevenue = tours.reduce((sum, tour) => {
      const price = tour.price || 0;
      const bookings = tour.bookings || 0;
      return sum + (price * bookings);
    }, 0);
    
    // Fetch all completed payments related to this guide's tours
    const tourIds = tours.map(t => t._id);
    const payments = await Payment.find({ tourId: { $in: tourIds }, status: 'completed' });
    
    // Count tourists based on participants in payments
    const touristsCount = payments.reduce((sum, payment) => {
      return sum + (payment.participants || 1);
    }, 0);

    // Count payments received
    const paymentsReceived = payments.length;
    
    // Calculate average rating
    const ratings = await Rating.find({ guideId });
    let rating = 0;
    if (ratings.length > 0) {
      const ratingSum = ratings.reduce((sum, r) => sum + r.rating, 0);
      rating = ratingSum / ratings.length;
    }
    
    // Update or create stats
    const stats = await GuideStats.findOneAndUpdate(
      { guideId },
      {
        activeTours,
        privateTours,
        completedTours,
        totalRevenue,
        touristsCount,
        paymentsReceived,
        rating,
        reviewCount: ratings.length,
        lastUpdated: new Date()
      },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error recalculating guide stats:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Increment a specific stat for a guide
 */
exports.incrementStat = async (req, res) => {
  try {
    const { guideId } = req.params;
    const { statName, amount = 1 } = req.body;
    
    if (!guideId || !statName) {
      return res.status(400).json({ 
        message: 'Guide ID and stat name are required' 
      });
    }
    
    // Validate that statName is a valid field in our schema
    const validStats = [
      'activeTours', 'privateTours', 'completedTours', 
      'totalRevenue', 'touristsCount',
      'paymentsReceived', 'reviewCount'
    ];
    
    if (!validStats.includes(statName)) {
      return res.status(400).json({ 
        message: `Invalid stat name. Must be one of: ${validStats.join(', ')}` 
      });
    }
    
    // Create the update object with the increment
    const update = {
      $inc: { [statName]: amount },
      $set: { lastUpdated: new Date() }
    };
    
    // Update the stats
    const stats = await GuideStats.findOneAndUpdate(
      { guideId },
      update,
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error incrementing guide stat:', error);
    res.status(500).json({ message: error.message });
  }
};
