const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Preference = require('../models/Preference');

// @route   GET /api/preferences/:userId
// @desc    Get user preferences by userId
// @access  Public (pour le développement, devrait être privé en production)
router.get('/:userId', async (req, res) => {
  try {
    // Removed verbose logging
    let preferences = await Preference.findOne({ userId: req.params.userId });
    
    // Si les préférences n'existent pas, créer un nouvel objet de préférences
    if (!preferences) {
      preferences = new Preference({
        userId: req.params.userId,
        languages: ['Français', 'Anglais', 'Arabe'],  // Valeurs par défaut pour le développement
        travelPurpose: [],
        travelCompanions: [],
        budget: []
      });
      await preferences.save();
    }
    
    res.json(preferences);
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des préférences' });
  }
});

// @route   PUT /api/preferences/:userId
// @desc    Update user preferences by userId
// @access  Public (pour le développement, devrait être privé en production)
router.put('/:userId', async (req, res) => {
  try {
    // Removed verbose logging
    
    const { languages, travelPurpose, travelCompanions, budget } = req.body;
    
    // Construire l'objet de mise à jour
    const preferencesFields = {};
    if (languages !== undefined) preferencesFields.languages = languages;
    if (travelPurpose !== undefined) preferencesFields.travelPurpose = travelPurpose;
    if (travelCompanions !== undefined) preferencesFields.travelCompanions = travelCompanions;
    if (budget !== undefined) preferencesFields.budget = budget;
    
    console.log('Champs à mettre à jour:', preferencesFields);
    
    let preferences = await Preference.findOne({ userId: req.params.userId });
    
    if (preferences) {
      // Mettre à jour les préférences existantes
      preferences = await Preference.findOneAndUpdate(
        { userId: req.params.userId },
        { $set: preferencesFields },
        { new: true }
      );
    } else {
      // Créer de nouvelles préférences
      preferences = new Preference({
        userId: req.params.userId,
        ...preferencesFields
      });
      await preferences.save();
    }
    res.json(preferences);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des préférences' });
  }
});

module.exports = router;
