const express = require('express');
const router = express.Router();
const guideStatsController = require('../controllers/guideStatsController');
const auth = require('../middleware/auth');

// Get stats for a specific guide
router.get('/guides/:guideId/stats', auth, guideStatsController.getGuideStats);

// Update tour status stats for a guide
router.put('/guides/:guideId/stats/tour-status', auth, guideStatsController.updateTourStatusStats);

// Recalculate all stats for a guide
router.post('/guides/:guideId/stats/recalculate', auth, guideStatsController.recalculateAllStats);

// Increment a specific stat for a guide
router.put('/guides/:guideId/stats/increment', auth, guideStatsController.incrementStat);

module.exports = router;
