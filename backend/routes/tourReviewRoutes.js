const express = require('express');
const router = express.Router();
const tourReviewController = require('../controllers/tourReviewController');
const auth = require('../middleware/auth');

// Créer un nouvel avis (nécessite authentification)
router.post('/', auth, tourReviewController.createTourReview);

// Récupérer tous les avis d'un tour (public)
router.get('/tour/:tourId', tourReviewController.getTourReviews);

// Supprimer un avis (nécessite authentification)
router.delete('/:reviewId', auth, tourReviewController.deleteTourReview);

module.exports = router;
