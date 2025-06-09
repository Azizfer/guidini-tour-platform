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

module.exports = router;
