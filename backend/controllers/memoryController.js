const Memory = require('../models/memory');

exports.createMemory = async (req, res) => {
  try {
    const { tourId, url } = req.body;
    if (!tourId || !url) {
      return res.status(400).json({ message: 'tourId and url required' });
    }
    const memory = await Memory.create({ tourId, url, user: req.user.id });
    res.status(201).json(memory);
  } catch (err) {
    console.error('Create memory error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMemoriesByGuide = async (req, res) => {
  try {
    const guideId = req.params.guideId;
    const memories = await Memory.find({ user: guideId }).sort({ date: -1 });
    res.json(memories);
  } catch (err) {
    console.error('Get memories error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
