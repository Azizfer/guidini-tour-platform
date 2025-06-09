const TourReview = require('../models/TourReview');
const Tour = require('../models/Tour');
const User = require('../models/User');
const GuideStats = require('../models/GuideStats');
const Notification = require('../models/Notification');

// Create new tour review with all functionality
exports.createTourReview = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { tourId, rating, message } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!tourId || !rating) {
      console.error('Missing required fields');
      return res.status(400).json({ message: 'Tour ID and rating are required' });
    }

    // Validate rating range
    if (rating < 0 || rating > 5) {
      console.error('Invalid rating value:', rating);
      return res.status(400).json({ message: 'Rating must be between 0 and 5' });
    }

    // Check tour exists and is completed
    const tour = await Tour.findById(tourId);
    if (!tour) {
      console.error('Tour not found:', tourId);
      return res.status(404).json({ message: 'Tour not found' });
    }
    
    if (tour.tourStatus !== 'completed') {
      console.error('Tour not completed:', tour.tourStatus);
      return res.status(400).json({ message: 'Cannot review incomplete tours' });
    }

    // Get guide ID
    const guideId = tour.guideId;
    if (!guideId) {
      console.error('No guide associated with tour:', tourId);
      return res.status(400).json({ message: 'No guide associated with this tour' });
    }

    // Check for existing review
    const existingReview = await TourReview.findOne({ tourId, userId });
    if (existingReview) {
      console.error('Duplicate review attempt:', { tourId, userId });
      return res.status(400).json({ 
        message: `You already reviewed this tour on ${existingReview.createdAt.toLocaleDateString()}`
      });
    }

    // Create and save new review
    console.log('Creating new review for tour:', tourId);
    const newReview = new TourReview({ tourId, userId, guideId, rating, message });
    const savedReview = await newReview.save();
    console.log('Review created:', savedReview._id);

    // Update tour statistics
    const allTourReviews = await TourReview.find({ tourId });
    const averageTourRating = allTourReviews.reduce((sum, review) => sum + review.rating, 0) / allTourReviews.length;
    
    tour.rating = averageTourRating;
    tour.reviewCount = allTourReviews.length;
    await tour.save();
    console.log('Tour stats updated:', tourId);

    // Update guide statistics
    const allGuideReviews = await TourReview.find({ guideId });
    const totalGuideRating = allGuideReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageGuideRating = totalGuideRating / allGuideReviews.length;

    // Update GuideStats collection using existing rating/reviewCount fields
    await GuideStats.findOneAndUpdate(
      { guideId },
      {
        $set: { rating: averageGuideRating, reviewCount: allGuideReviews.length }
      },
      { upsert: true, new: true }
    );
    console.log('GuideStats updated for guide:', guideId);

    // Update User model for backward compatibility
    await User.findByIdAndUpdate(guideId, {
      $set: { 'stats.averageRating': averageGuideRating },
      $inc: { 'stats.totalReviews': 1 }
    });
    console.log('User stats updated for guide:', guideId);

    /* -------------------------------------------------------------
       Create notification for the guide to inform about new review
    --------------------------------------------------------------*/
    try {
      // Fetch reviewer info for personalized message
      const reviewer = await User.findById(userId).select('name username profileImage');
      const reviewerName = reviewer?.name || reviewer?.username || 'Un utilisateur';

      // Build notification payload (only for guide)
      await Notification.create({
        recipient: guideId,
        title: 'Nouvelle évaluation',
        description: `${reviewerName} a laissé une note de ${rating} ⭐ sur votre visite "${tour.title}"`,
        type: 'review',
        tourId,
        guideId,
        userId,
        avatar: reviewer?.profileImage || undefined,
      });

      console.log('Review notification sent to guide:', guideId);
    } catch (notifErr) {
      console.error('Failed to create review notification:', notifErr.message);
    }

    res.status(201).json({
      message: 'Review submitted successfully',
      review: savedReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les avis d'un tour
exports.getTourReviews = async (req, res) => {
  try {
    const { tourId } = req.params;
    
    // Vérifier si le tour existe
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }

    // Récupérer tous les avis pour ce tour avec les informations de l'utilisateur
    const reviews = await TourReview.find({ tourId })
      .populate('userId', 'name username profileImage')
      .sort({ createdAt: -1 });

    // Simplifier les données retournées pour ne montrer que les notes
    const simplifiedReviews = reviews.map(review => ({
      _id: review._id,
      rating: review.rating,
      user: {
        _id: review.userId._id,
        name: review.userId.name,
        username: review.userId.username,
        profileImage: review.userId.profileImage
      },
      createdAt: review.createdAt
    }));

    res.status(200).json({
      averageRating: tour.rating,
      reviewCount: tour.reviewCount,
      reviews: simplifiedReviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reviews for a guide
exports.getGuideReviews = async (req, res) => {
  try {
    const { guideId } = req.params;

    // Validate guide exists
    const guide = await User.findById(guideId);
    if (!guide) {
      return res.status(404).json({ message: 'Guide non trouvé' });
    }

    // Fetch reviews for all completed tours of this guide
    const reviews = await TourReview.find({ guideId })
      .populate('userId', 'name username profileImage')
      .sort({ createdAt: -1 });

    const simplifiedReviews = reviews.map((review) => ({
      _id: review._id,
      rating: review.rating,
      message: review.message,
      user: {
        _id: review.userId._id,
        name: review.userId.name,
        username: review.userId.username,
        profileImage: review.userId.profileImage,
      },
      createdAt: review.createdAt,
    }));

    // Calculate average rating and count
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.status(200).json({
      averageRating,
      reviewCount: reviews.length,
      reviews: simplifiedReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un avis
exports.deleteTourReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    // Vérifier si l'avis existe
    const review = await TourReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }

    // Vérifier que l'utilisateur est bien l'auteur de l'avis
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: 'Vous n\'êtes pas autorisé à supprimer cet avis' 
      });
    }

    // Récupérer l'ID du tour et du guide avant de supprimer l'avis
    const tourId = review.tourId;
    const guideId = review.guideId;

    // Supprimer l'avis
    await TourReview.findByIdAndDelete(reviewId);

    // Mettre à jour la note moyenne et le nombre d'avis du tour
    const allTourReviews = await TourReview.find({ tourId });
    
    // Mettre à jour le tour
    const tour = await Tour.findById(tourId);
    if (tour) {
      if (allTourReviews.length === 0) {
        tour.rating = 0;
        tour.reviewCount = 0;
      } else {
        const totalTourRating = allTourReviews.reduce((sum, review) => sum + review.rating, 0);
        tour.rating = totalTourRating / allTourReviews.length;
        tour.reviewCount = allTourReviews.length;
      }
      await tour.save();
    }

    // Mettre à jour la note moyenne du guide
    const allGuideReviews = await TourReview.find({ guideId });
    
    // Mettre à jour les statistiques du guide
    const guide = await User.findById(guideId);
    if (guide && guide.stats) {
      if (allGuideReviews.length === 0) {
        guide.stats.averageRating = 0;
      } else {
        const totalGuideRating = allGuideReviews.reduce((sum, review) => sum + review.rating, 0);
        guide.stats.averageRating = totalGuideRating / allGuideReviews.length;
      }
      await guide.save();
    }

    // Update GuideStats as well
    const newAverage =
      allGuideReviews.length === 0
        ? 0
        : allGuideReviews.reduce((sum, r) => sum + r.rating, 0) / allGuideReviews.length;

    await GuideStats.findOneAndUpdate(
      { guideId },
      {
        $set: { rating: newAverage, reviewCount: allGuideReviews.length }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Note supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
