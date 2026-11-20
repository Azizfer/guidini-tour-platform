// routes/adminGuides.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Guide = require('../models/Guide');

// GET /api/admin/guides?status=pending|verified|rejected
router.get('/', auth, admin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { verificationStatus: status } : {};
    const guides = await Guide.find(query).select('-password'); // exclude password/hash
    res.json(guides);
  } catch (error) {
    console.error('Erreur lors de la récupération des guides (admin):', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des guides.' });
  }
});

// POST /api/admin/guides/:id/approve
router.post('/:id/approve', auth, admin, async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'verified' },
      { new: true }
    );
    if (!guide) {
      return res.status(404).json({ message: 'Guide non trouvé.' });
    }
    res.json(guide);
  } catch (error) {
    console.error('Erreur lors de l\'approbation du guide:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'approbation.' });
  }
});

// POST /api/admin/guides/:id/reject
router.post('/:id/reject', auth, admin, async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'rejected' },
      { new: true }
    );
    if (!guide) {
      return res.status(404).json({ message: 'Guide non trouvé.' });
    }
    res.json(guide);
  } catch (error) {
    console.error('Erreur lors du rejet du guide:', error);
    res.status(500).json({ message: 'Erreur serveur lors du rejet.' });
  }
});

module.exports = router;
