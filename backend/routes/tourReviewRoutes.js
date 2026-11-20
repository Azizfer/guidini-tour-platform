const express = require('express');
const router = express.Router();
const tourReviewController = require('../controllers/tourReviewController');
const auth = require('../middleware/auth');

// Log all incoming requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Create new review (requires auth)
router.post('/', 
  auth, 
  (req, res, next) => {
    console.log('POST /api/tour-reviews hit!');
    tourReviewController.createTourReview(req, res, next);
  }
);

// Get all reviews for a tour (public)
router.get('/tour/:tourId', tourReviewController.getTourReviews);

// Get all reviews for a tour (alternative endpoint)
router.get('/tour/:tourId', 
  (req, res, next) => {
    console.log('GET reviews for tour:', req.params.tourId);
    tourReviewController.getTourReviews(req, res, next);
  }
);

// Get all reviews for a guide (public)
router.get('/guide/:guideId', (req, res, next) => {
  console.log('GET reviews for guide:', req.params.guideId);
  tourReviewController.getGuideReviews(req, res, next);
});

// Delete a review (requires auth)
router.delete('/:reviewId', auth, tourReviewController.deleteTourReview);

module.exports = router;
