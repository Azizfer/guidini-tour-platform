const TourReview = require('../models/TourReview');
const Tour = require('../models/Tour');
const User = require('../models/User');

// Créer un nouvel avis sur un tour (simplifié pour ne contenir que des étoiles)
exports.createTourReview = async (req, res) => {
  try {
    const { tourId, rating } = req.body;
    const userId = req.user._id;

    // Vérifier si le tour existe et s'il est marqué comme complété
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }

    // Vérifier que le tour est marqué comme complété
    if (!tour.isCompleted) {
      return res.status(400).json({ 
        message: 'Vous ne pouvez pas noter un tour qui n\'est pas encore complété' 
      });
    }

    // Récupérer l'ID du guide
    const guideId = tour.guideId;
    if (!guideId) {
      return res.status(400).json({ 
        message: 'Impossible de trouver le guide associé à ce tour' 
      });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis sur ce tour
    const existingReview = await TourReview.findOne({ tourId, userId });
    if (existingReview) {
      return res.status(400).json({ 
        message: 'Vous avez déjà laissé un avis sur ce tour' 
      });
    }

    // Créer le nouvel avis
    const newReview = new TourReview({
      tourId,
      userId,
      guideId,
      rating
    });

    // Sauvegarder l'avis
    const savedReview = await newReview.save();

    // Mettre à jour la note moyenne et le nombre d'avis du tour
    const allTourReviews = await TourReview.find({ tourId });
    const totalTourRating = allTourReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageTourRating = totalTourRating / allTourReviews.length;

    tour.rating = averageTourRating;
    tour.reviewCount = allTourReviews.length;
    await tour.save();

    // Mettre à jour la note moyenne du guide
    const allGuideReviews = await TourReview.find({ guideId });
    const totalGuideRating = allGuideReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageGuideRating = totalGuideRating / allGuideReviews.length;

    // Mettre à jour les statistiques du guide
    const guide = await User.findById(guideId);
    if (guide && guide.stats) {
      guide.stats.averageRating = averageGuideRating;
      await guide.save();
    }

    res.status(201).json({
      success: true,
      message: 'Note ajoutée avec succès',
      review: savedReview
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
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

// Note: La fonction addImageToReview a été supprimée car nous simplifions le système d'avis pour ne contenir que des étoiles

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

    res.status(200).json({
      success: true,
      message: 'Note supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
