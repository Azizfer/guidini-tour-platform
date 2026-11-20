const Rating = require('../models/Rating');
const Tour = require('../models/Tour');
const Guide = require('../models/Guide');
const mongoose = require('mongoose');

// Add a rating to a tour
exports.addRating = async (req, res) => {
  try {
    const { tourId, rating } = req.body;
    
    if (!tourId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Veuillez fournir un ID de tour valide et une note entre 1 et 5' 
      });
    }
    
    // Verify the tour exists and is completed
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }
    
    if (!tour.isCompleted) {
      return res.status(400).json({ 
        message: 'Impossible de noter un tour qui n\'est pas encore complété' 
      });
    }
    
    // Check if the user has already rated this tour
    const existingRating = await Rating.findOne({ 
      tourId: tourId,
      userId: req.user._id
    });
    
    if (existingRating) {
      return res.status(400).json({ 
        message: 'Vous avez déjà noté ce tour' 
      });
    }
    
    // Create the new rating
    const newRating = new Rating({
      tourId,
      userId: req.user._id,
      guideId: tour.guideId,
      rating
    });
    
    await newRating.save();
    
    // Update the tour's average rating
    const tourRatings = await Rating.find({ tourId });
    const tourRatingSum = tourRatings.reduce((sum, r) => sum + r.rating, 0);
    const tourAverageRating = tourRatingSum / tourRatings.length;
    
    tour.rating = tourAverageRating;
    tour.reviewCount = tourRatings.length;
    await tour.save();
    
    // Update the guide's average rating
    const guideRatings = await Rating.find({ guideId: tour.guideId });
    const guideRatingSum = guideRatings.reduce((sum, r) => sum + r.rating, 0);
    const guideAverageRating = guideRatingSum / guideRatings.length;
    
    await Guide.findByIdAndUpdate(tour.guideId, {
      'stats.averageRating': guideAverageRating,
      reviewCount: guideRatings.length
    });
    
    res.status(201).json({
      success: true,
      message: 'Note ajoutée avec succès',
      rating: newRating,
      tourRating: {
        average: tourAverageRating,
        count: tourRatings.length
      }
    });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get ratings for a tour
exports.getTourRatings = async (req, res) => {
  try {
    const { tourId } = req.params;
    
    const ratings = await Rating.find({ tourId })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });
    
    res.status(200).json(ratings);
  } catch (error) {
    console.error('Error getting tour ratings:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get ratings for a guide
exports.getGuideRatings = async (req, res) => {
  try {
    const { guideId } = req.params;
    
    const ratings = await Rating.find({ guideId })
      .populate('userId', 'name profileImage')
      .populate('tourId', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json(ratings);
  } catch (error) {
    console.error('Error getting guide ratings:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's rating for a specific tour
exports.getUserTourRating = async (req, res) => {
  try {
    const { tourId } = req.params;
    const userId = req.user._id;
    
    const rating = await Rating.findOne({ tourId, userId });
    
    if (!rating) {
      return res.status(404).json({ message: 'Aucune note trouvée' });
    }
    
    res.status(200).json(rating);
  } catch (error) {
    console.error('Error getting user tour rating:', error);
    res.status(500).json({ message: error.message });
  }
};
