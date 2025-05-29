const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Route pour récupérer tous les guides
router.get('/guides', async (req, res) => {
  try {
    // Rechercher tous les utilisateurs de type "guide"
    const guides = await User.find({ userType: 'guide' })
      .select('-password') // Exclure le mot de passe
      .sort({ createdAt: -1 }); // Trier par date de création (plus récent d'abord)
    
    res.json(guides);
  } catch (error) {
    console.error('Erreur lors de la récupération des guides:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des guides' });
  }
});

// Route pour récupérer un guide par son ID
router.get('/guides/:id', async (req, res) => {
  try {
    const guide = await User.findOne({ 
      _id: req.params.id,
      userType: 'guide'
    }).select('-password');
    
    if (!guide) {
      return res.status(404).json({ error: 'Guide non trouvé' });
    }
    
    res.json(guide);
  } catch (error) {
    console.error(`Erreur lors de la récupération du guide ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération du guide' });
  }
});

// Route pour récupérer le profil de l'utilisateur connecté
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Route pour mettre à jour le profil d'un guide
router.put('/guides/:id', async (req, res) => {
  try {
    console.log(`Mise à jour du guide ${req.params.id}`);
    console.log('===== DEBUG: BACKEND RECEIVED DATA =====');
    console.log('Données reçues:', JSON.stringify(req.body, null, 2));
    
    // Pour le développement, nous ne vérifions pas l'authentification
    // En production, il faudrait vérifier si l'utilisateur est autorisé à modifier ce profil
    
    // Préparer les mises à jour
    const updates = {};
    
    // Traiter les champs simples
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.website) updates.website = req.body.website;
    if (req.body.location) updates.location = req.body.location;
    
    // Traiter les années d'expérience
    if (req.body.yearsOfExperience !== undefined) {
      updates.yearsOfExperience = Number(req.body.yearsOfExperience);
    }
    
    // Traiter les langues
    if (req.body.languages) {
      // Si c'est une chaîne JSON, la parser
      if (typeof req.body.languages === 'string' && req.body.languages.startsWith('[')) {
        try {
          updates.languages = JSON.parse(req.body.languages);
        } catch (e) {
          console.error('Erreur lors du parsing des langues:', e);
          updates.languages = req.body.languages.split(',').map(lang => lang.trim()).filter(Boolean);
        }
      }
      // Si c'est déjà un tableau, l'utiliser tel quel
      else if (Array.isArray(req.body.languages)) {
        updates.languages = req.body.languages;
      }
      // Si c'est une chaîne simple, la diviser par virgules
      else if (typeof req.body.languages === 'string') {
        updates.languages = req.body.languages.split(',').map(lang => lang.trim()).filter(Boolean);
      }
    }
    
    // Traiter les domaines d'expertise
    if (req.body.expertise) {
      // Si c'est une chaîne JSON, la parser
      if (typeof req.body.expertise === 'string' && req.body.expertise.startsWith('[')) {
        try {
          updates.expertise = JSON.parse(req.body.expertise);
        } catch (e) {
          console.error('Erreur lors du parsing des expertises:', e);
          updates.expertise = req.body.expertise.split(',').map(exp => exp.trim()).filter(Boolean);
        }
      }
      // Si c'est déjà un tableau, l'utiliser tel quel
      else if (Array.isArray(req.body.expertise)) {
        updates.expertise = req.body.expertise;
      }
      // Si c'est une chaîne simple, la diviser par virgules
      else if (typeof req.body.expertise === 'string') {
        updates.expertise = req.body.expertise.split(',').map(exp => exp.trim()).filter(Boolean);
      }
    }
    
    console.log('Mises à jour à appliquer:', JSON.stringify(updates, null, 2));

    // Mettre à jour le profil - utiliser directement le modèle Guide pour s'assurer que les champs spécifiques sont mis à jour
    const Guide = require('../models/Guide');
    const updatedGuide = await Guide.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedGuide) {
      console.log('Guide non trouvé');
      return res.status(404).json({ error: 'Guide non trouvé' });
    }

    console.log('Guide mis à jour avec succès:', updatedGuide);
    res.json(updatedGuide);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du guide ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du guide' });
  }
});

// Configuration de multer pour le téléchargement d'images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
  fileFilter: function(req, file, cb) {
    // Accepter uniquement les images
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Seuls les fichiers image sont autorisés!'), false);
    }
    cb(null, true);
  }
});

// Route pour télécharger une image de profil
router.post('/:id/profile-image', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier image fourni' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour l'image de profil de l'utilisateur
    const profileImagePath = '/uploads/' + req.file.filename;
    user.profileImage = profileImagePath;
    await user.save();

    res.json({
      success: true,
      profileImage: profileImagePath,
      message: 'Image de profil mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image de profil:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement de l\'image de profil' });
  }
});

module.exports = router;
