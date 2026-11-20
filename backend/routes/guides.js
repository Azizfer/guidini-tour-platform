const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const auth = require('../middleware/auth');

// Get all guides (public)
router.get('/', guideController.getAllGuides);

// Get guide by ID (public)
router.get('/:id', guideController.getGuideById);

// Note: The guide stats route has been removed and replaced with the new GuideStats model

module.exports = router;
