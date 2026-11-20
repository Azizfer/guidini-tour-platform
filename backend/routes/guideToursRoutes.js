const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');
const auth = require('../middleware/auth');

// Get guide's tours by status
router.get('/:guideId/tours', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const tours = await Tour.find({
      guideId: req.params.guideId,
      tourStatus: status || 'active'
    }).sort({ createdAt: -1 });
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get guide's tour stats (counts)
router.get('/:guideId/stats', auth, async (req, res) => {
  try {
    const guideId = req.params.guideId;
    const [active, completed] = await Promise.all([
      Tour.countDocuments({ guideId, tourStatus: 'active' }),
      Tour.countDocuments({ guideId, tourStatus: 'completed' }),
    ]);
    res.json({ activeTours: active, completedTours: completed });
  } catch (error) {
    console.error('Error fetching tour stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques de circuits' });
  }
});

module.exports = router;
