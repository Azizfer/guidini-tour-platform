const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');

// Add a rating to a tour (requires authentication)
router.post('/', auth, ratingController.addRating);

// Get ratings for a tour
router.get('/tour/:tourId', ratingController.getTourRatings);

// Get ratings for a guide
router.get('/guide/:guideId', ratingController.getGuideRatings);

// Get user's rating for a specific tour (requires authentication)
router.get('/user/tour/:tourId', auth, ratingController.getUserTourRating);

module.exports = router;
