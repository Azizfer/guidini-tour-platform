const Tour = require('../models/Tour');
const cloudinary = require('../config/cloudinary');

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
    // Check if we should include guide details
    const includeGuide = req.query.includeGuide === 'true';
    
    // Create query with optional population
    let query = Tour.findById(req.params.id);
    
    // If includeGuide is true, populate the guide field
    if (includeGuide) {
      query = query.populate('guideId', '_id name email profileImage');
    }
    
    // Execute the query
    const tour = await query;
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }
    
    // Return the tour with guide information if requested
    res.status(200).json(tour);
  } catch (error) {
    console.error('Error fetching tour by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// Créer un nouveau tour
exports.createTour = async (req, res) => {
  try {
    // Vérifier que les données requises sont présentes
    if (!req.body.title || !req.body.description || !req.body.location || 
        !req.body.duration || !req.body.date || !req.body.time || 
        req.body.price <= 0 || req.body.maxParticipants <= 0) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises' });
    }
    
    let imageUrl = req.body.image;
    if (req.file) {
      try {
        const uploadRes = await cloudinary.uploader.upload(req.file.path, {
          folder: 'guidini/Tours',
        });
        imageUrl = uploadRes.secure_url;
      } catch (err) {
        console.error('❌ Cloudinary upload failed:', err.message);
        return res.status(500).json({ message: 'Échec du téléchargement de l\'image' });
      }
    }
    
    const newTour = new Tour({
      ...req.body,
      guideId: req.user._id,
      image: imageUrl,
    });
    
    const savedTour = await newTour.save();
    
    res.status(201).json(savedTour);
  } catch (error) {
    console.error('Erreur lors de la création du tour:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un tour
exports.updateTour = async (req, res) => {
  try {
    // Vérifier d'abord si le tour est complété
    const existingTour = await Tour.findById(req.params.id);
    if (!existingTour) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }
    
    // Empêcher la modification des tours complétés
    if (existingTour.tourStatus === 'completed') {
      return res.status(403).json({ 
        message: 'Impossible de modifier un tour complété. Les tours complétés sont verrouillés pour les évaluations.' 
      });
    }
    
    const updates = { ...req.body };
    if (req.file) {
      try {
        const uploadRes = await cloudinary.uploader.upload(req.file.path, {
          folder: 'guidini/Tours',
        });
        updates.image = uploadRes.secure_url;
      } catch (err) {
        console.error('❌ Cloudinary upload failed:', err.message);
        return res.status(500).json({ message: 'Échec du téléchargement de l\'image' });
      }
    }
    
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedTour);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du tour:', error.message);
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

// Basculer la visibilité d'un tour (public/privé)
exports.toggleTourVisibility = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }
    
    // Toggle between 'active' (public) and 'private' status
    // If the tour is completed, we don't change its status
    if (tour.tourStatus === 'completed') {
      return res.status(403).json({ 
        message: 'Impossible de modifier la visibilité d\'un tour complété.'
      });
    }
    
    // Toggle the status between active and private
    tour.tourStatus = tour.tourStatus === 'active' ? 'private' : 'active';
    await tour.save();
    
    res.status(200).json({
      ...tour._doc,
      message: `Le tour est maintenant ${tour.tourStatus === 'active' ? 'public' : 'privé'}.`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Marquer un tour comme complété
exports.markTourAsCompleted = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }
    
    // Vérifier que l'utilisateur est bien le guide de ce tour
    if (tour.guideId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce tour' });
    }
    
    // Vérifier si le tour est déjà marqué comme complété
    if (tour.tourStatus === 'completed') {
      return res.status(400).json({ message: 'Ce tour est déjà marqué comme complété' });
    }
    
    // Marquer le tour comme complété
    tour.tourStatus = 'completed';
    await tour.save();
    
    // Mettre à jour le compteur de tours complétés du guide
    const Guide = require('../models/Guide');
    await Guide.findByIdAndUpdate(tour.guideId, {
      $inc: { 'stats.completedTours': 1 }
    });
    
    res.status(200).json({
      success: true,
      message: 'Tour marqué comme complété',
      tour
    });
  } catch (error) {
    console.error('Erreur lors du marquage du tour comme complété:', error);
    res.status(400).json({ message: error.message });
  }
};