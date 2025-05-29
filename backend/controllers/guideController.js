const Guide = require('../models/Guide');
const Tour = require('../models/Tour');
const Rating = require('../models/Rating');

// Récupérer les détails d'un guide par son ID
exports.getGuideById = async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id)
      .select('name email profileImage bio languages specialties verificationStatus');
    
    if (!guide) {
      return res.status(404).json({ message: 'Guide non trouvé' });
    }
    
    res.status(200).json(guide);
  } catch (error) {
    console.error('Erreur lors de la récupération du guide:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les guides
exports.getAllGuides = async (req, res) => {
  try {
    const guides = await Guide.find()
      .select('name email profileImage bio languages specialties verificationStatus');
    
    res.status(200).json(guides);
  } catch (error) {
    console.error('Erreur lors de la récupération des guides:', error);
    res.status(500).json({ message: error.message });
  }
};

// Note: The guide stats functionality has been removed
