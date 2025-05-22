const Tour = require('../models/Tour');

// Récupérer tous les tours
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les tours d'un guide spécifique
exports.getToursByGuide = async (req, res) => {
  try {
    const tours = await Tour.find({ guideId: req.params.guideId });
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un tour par son ID
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }
    res.status(200).json(tour);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un nouveau tour
exports.createTour = async (req, res) => {
  try {
    console.log('Contrôleur createTour: Requête reçue');
    console.log('Contrôleur createTour: Données du corps:', req.body);
    console.log('Contrôleur createTour: Utilisateur authentifié:', req.user);
    
    // Vérifier que les données requises sont présentes
    if (!req.body.title || !req.body.description || !req.body.location || 
        !req.body.duration || !req.body.date || !req.body.time || 
        req.body.price <= 0 || req.body.maxParticipants <= 0) {
      console.error('Contrôleur createTour: Données incomplètes');
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises' });
    }
    
    const newTour = new Tour({
      ...req.body,
      guideId: req.user._id // Assurez-vous que l'ID du guide est ajouté depuis l'authentification
    });
    
    console.log('Contrôleur createTour: Nouveau tour à créer:', newTour);
    
    const savedTour = await newTour.save();
    console.log('Contrôleur createTour: Tour créé avec succès:', savedTour);
    
    res.status(201).json(savedTour);
  } catch (error) {
    console.error('Contrôleur createTour: Erreur lors de la création du tour:', error);
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un tour
exports.updateTour = async (req, res) => {
  try {
    console.log('Contrôleur updateTour: Requête reçue');
    console.log('Contrôleur updateTour: Données du corps:', req.body);
    console.log('Contrôleur updateTour: ID du tour à mettre à jour:', req.params.id);
    
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedTour) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }
    
    res.status(200).json(updatedTour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un tour
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }
    
    res.status(200).json({ message: 'Tour supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Changer la visibilité d'un tour
exports.toggleTourVisibility = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }
    
    tour.isPublic = !tour.isPublic;
    await tour.save();
    
    res.status(200).json(tour);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};