const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for document uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté. Les fichiers acceptés sont: JPG, JPEG, PNG, PDF.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Custom upload middleware for Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const { fieldname } = req.file;
    let uploadPath;

    // Set different paths based on file type
    if (fieldname === 'idCard') {
      uploadPath = 'guidini/documents/carteID';
    } else if (fieldname === 'certificate') {
      uploadPath = 'guidini/documents/CertifGuide';
    } else {
      uploadPath = 'guidini/documents';
    }

    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: uploadPath,
        resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'raw'
      }
    );

    req.file.path = result.secure_url;
    next();
  } catch (error) {
    console.error('Erreur lors du téléchargement sur Cloudinary:', error);
    next(error);
  }
};

// Use the custom upload middleware for document uploads
router.post('/:id/id-card', auth, upload.single('idCard'), uploadToCloudinary, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier de carte d\'identité fourni' });
    }

    // Vérifier si l'utilisateur existe et est un guide
    const user = await User.findById(req.params.id);
    if (!user || user.userType !== 'guide') {
      return res.status(404).json({ error: 'Guide non trouvé' });
    }

    // Mettre à jour le chemin de la carte d'identité
    const idCardPath = req.file.path;
    user.documents.idCard = idCardPath;
    await user.save();

    res.json({
      success: true,
      idCard: idCardPath,
      message: 'Carte d\'identité mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement de la carte d\'identité:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement de la carte d\'identité' });
  }
});

router.post('/signup/id-card', upload.single('idCard'), uploadToCloudinary, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier carte d\'identité fourni' });
    }

    // Get user ID from body (sent by frontend)
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'ID utilisateur manquant' });
    }

    // Find or create user
    let user = await User.findById(userId);
    if (!user) {
      user = await User.create({
        _id: userId,
        documents: {
          idCard: '',
          certificate: ''
        }
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'raw',
        folder: 'guidini/documents/carteID'
      }
    );

    // Update user document
    user.documents.idCard = result.secure_url;
    await user.save();

    res.status(200).json({ url: result.secure_url, message: 'Carte d\'identité téléchargée avec succès' });
  } catch (error) {
    console.error('Error uploading ID card:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement de la carte d\'identité' });
  }
});

router.post('/:id/certificate', auth, upload.single('certificate'), uploadToCloudinary, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'raw',
        folder: 'guidini/documents/CertifGuide'
      }
    );

    // Update user document
    user.documents.certificate = result.secure_url;
    await user.save();

    res.status(200).json({ url: result.secure_url, message: 'Certificate uploaded successfully' });
  } catch (error) {
    console.error('Error uploading certificate:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement du certificat' });
  }
});

router.post('/signup/profile-image', upload.single('profileImage'), uploadToCloudinary, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier image fourni' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mettre à jour l'image de profil de l'utilisateur avec l'URL Cloudinary
    const profileImagePath = req.file.path; // Cloudinary returns secure URL in .path
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

// Route pour récupérer tous les utilisateurs (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('-password'); // Ne pas inclure le mot de passe
    
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Route pour récupérer tous les guides
router.get('/guides', async (req, res) => {
  try {
    // Rechercher tous les utilisateurs de type "guide"
    const guides = await User.find({ userType: 'guide' })
      .sort({ createdAt: -1 }); // Trier par date de création (plus récent d'abord)
    
    guides.forEach(guide => delete guide.password);
    
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
    });
    
    if (!guide) {
      return res.status(404).json({ error: 'Guide non trouvé' });
    }
    
    delete guide.password;
    
    res.json(guide);
  } catch (error) {
    console.error(`Erreur lors de la récupération du guide ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la récupération du guide' });
  }
});

// Route pour rechercher des utilisateurs par nom ou email
router.get('/search', async (req, res) => {
  try {
    // Accepter ?query= ou ?q= comme nom de paramètre
    const searchTerm = (req.query.query || req.query.q || '').toString().trim();

    if (!searchTerm) {
      return res.status(400).json({ error: 'Paramètre de recherche manquant' });
    }

    // Construire une expression régulière insensible à la casse
    const regex = new RegExp(searchTerm, 'i');

    // Rechercher par nom ou email (limite 10 résultats)
    const users = await User.find(
      {
        $or: [
          { name: { $regex: regex } },
          { email: { $regex: regex } }
        ]
      }
    )
      .limit(10)
      .select('_id name email profileImage userType');

    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche d\'utilisateurs' });
  }
});

// Route pour récupérer le profil de l'utilisateur connecté
router.get('/profile', auth, async (req, res) => {
  try {
    const userDoc = await User.findById(req.user.id).lean();
    if (userDoc) delete userDoc.password;
    if (!userDoc) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(userDoc);
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
    // Allow direct profileImage URL update (e.g., Cloudinary secure_url)
    if (req.body.profileImage) updates.profileImage = req.body.profileImage;
    
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
          console.error('Erreur lors du parsing des domaines d\'expertise:', e);
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

    const updatedGuideDoc = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true, lean: true }
    );

    if (updatedGuideDoc) {
      delete updatedGuideDoc.password;
      console.log('Guide mis à jour avec succès:', updatedGuideDoc);
      res.json(updatedGuideDoc);
    } else {
      console.log('Guide non trouvé');
      res.status(404).json({ error: 'Guide non trouvé' });
    }
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du guide ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du guide' });
  }
});

module.exports = router;
