const express = require('express');
const router = express.Router();
const Guide = require('../../models/Guide');
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');

// Get all guides
router.get('/', [auth, admin], async (req, res) => {
  try {
    const guides = await Guide.find({});
    res.json(guides);
  } catch (error) {
    console.error('Error fetching guides:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve guide
router.post('/:id/approve', [auth, admin], async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    guide.verificationStatus = 'verified';
    await guide.save();
    
    res.json({ message: 'Guide approved successfully' });
  } catch (error) {
    console.error('Error approving guide:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject guide
router.post('/:id/reject', [auth, admin], async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: 'Guide not found' });
    }
    
    guide.verificationStatus = 'rejected';
    await guide.save();
    
    res.json({ message: 'Guide rejected successfully' });
  } catch (error) {
    console.error('Error rejecting guide:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
