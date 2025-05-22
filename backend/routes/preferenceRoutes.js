const express = require('express');
const router = express.Router();
const Preference = require('../models/Preference');
const auth = require('../middleware/auth');

// Get preferences for the current user
router.get('/me', auth, async (req, res) => {
  try {
    const preferences = await Preference.findOne({ userId: req.user.id });
    
    if (!preferences) {
      return res.status(404).json({ message: 'Preferences not found' });
    }
    
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update preferences
router.post('/', auth, async (req, res) => {
  try {
    const { languages, travelPurpose, travelCompanions, budget } = req.body;
    
    // Find existing preferences or create new ones
    let preferences = await Preference.findOne({ userId: req.user.id });
    
    if (preferences) {
      // Update existing preferences
      preferences.languages = languages || preferences.languages;
      preferences.travelPurpose = travelPurpose || preferences.travelPurpose;
      preferences.travelCompanions = travelCompanions || preferences.travelCompanions;
      preferences.budget = budget || preferences.budget;
    } else {
      // Create new preferences
      preferences = new Preference({
        userId: req.user.id,
        username: req.user.username,
        languages,
        travelPurpose,
        travelCompanions,
        budget
      });
    }
    
    await preferences.save();
    res.json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update specific preference field
router.patch('/:field', auth, async (req, res) => {
  try {
    const { field } = req.params;
    const { value } = req.body;
    
    // Validate field
    const validFields = ['languages', 'travelPurpose', 'travelCompanions', 'budget'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid preference field' });
    }
    
    // Find existing preferences or create new ones
    let preferences = await Preference.findOne({ userId: req.user.id });
    
    if (!preferences) {
      // Create new preferences with only the specified field
      const newPrefs = { userId: req.user.id, username: req.user.username };
      newPrefs[field] = value;
      
      preferences = new Preference(newPrefs);
    } else {
      // Update only the specified field
      preferences[field] = value;
    }
    
    await preferences.save();
    res.json(preferences);
  } catch (error) {
    console.error(`Error updating ${req.params.field} preferences:`, error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete preferences
router.delete('/', auth, async (req, res) => {
  try {
    await Preference.findOneAndDelete({ userId: req.user.id });
    res.json({ message: 'Preferences deleted successfully' });
  } catch (error) {
    console.error('Error deleting preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
