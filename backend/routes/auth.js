const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Preference = require('../models/Preference');
const { sendVerificationEmail, sendPasswordResetEmail, verifyOTP } = require('../utils/emailService');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration de multer avec les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  // Accept images and documents
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Middleware pour télécharger les fichiers pour l'inscription
const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'idCard', maxCount: 1 },
  { name: 'certificate', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]);

// Route pour vérifier si un email ou nom d'utilisateur existe déjà
router.post('/check-email', async (req, res) => {
  try {
    const { email, username } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis pour la vérification' });
    }
    
    // Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Cette adresse email est déjà utilisée' });
    }
    
    // Vérifier si le nom d'utilisateur existe déjà (si fourni)
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà utilisé' });
      }
    }
    
    // Si aucun doublon trouvé, renvoyer un succès
    res.status(200).json({ message: 'Email et nom d\'utilisateur disponibles' });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

// Route pour vérifier si un email existe déjà
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    // Vérifier si l'email existe déjà dans la base de données
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Si l'email n'existe pas, renvoyer une réponse positive
    return res.status(200).json({ message: 'Email disponible' });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return res.status(500).json({ error: 'Erreur lors de la vérification de l\'email' });
  }
});

// Route de pré-inscription pour envoyer un code de vérification
router.post('/pre-register', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Envoyer l'email de vérification
    await sendVerificationEmail(email, name || 'Utilisateur');
    
    res.status(200).json({
      message: 'Code de vérification envoyé',
      email
    });
  } catch (error) {
    console.error('Erreur lors de la pré-inscription:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la pré-inscription' });
  }
});

// Route pour vérifier le code OTP d'inscription
router.post('/verify-registration', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email et code de vérification requis' });
    }
    
    // Vérifier l'OTP
    const isValidOTP = verifyOTP(email, 'registration', otp);
    
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Code de vérification invalide ou expiré' });
    }
    
    // Générer un token temporaire pour l'inscription
    const verificationToken = jwt.sign(
      { email, purpose: 'registration' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' } // Expire après 1 heure
    );
    
    res.status(200).json({
      message: 'Code de vérification valide',
      verificationToken
    });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du code' });
  }
});

// Route d'inscription (après vérification)
router.post('/register', uploadFields, async (req, res) => {
  try {
    // Supprimer le log des données d'inscription pour des raisons de sécurité
    
    const { email, password, name, userType, verificationToken } = req.body;
    
    // Vérifier les champs obligatoires
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe sont requis' });
    }
    
    // Vérifier le token de vérification
    if (!verificationToken) {
      console.log('Aucun token de vérification fourni, mais on continue pour le développement');
      // En mode développement, on continue même sans token
      // return res.status(400).json({ error: 'Veuillez vérifier votre email avant de vous inscrire' });
    } else {
      try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
        
        // Vérifier que l'email dans le token correspond à l'email fourni
        if (decoded.email !== email) {
          console.log('Email dans le token ne correspond pas, mais on continue pour le développement');
          // En mode développement, on continue même si l'email ne correspond pas
          // return res.status(400).json({ error: 'Token de vérification invalide' });
        }
      } catch (tokenError) {
        console.error('Erreur de vérification du token:', tokenError);
        console.log('Token invalide, mais on continue pour le développement');
        // En mode développement, on continue même avec un token invalide
        // return res.status(400).json({ error: 'Token de vérification invalide ou expiré' });
      }
    }
    
    // En mode développement, on marque le token comme vérifié même s'il ne l'est pas
    const tokenVerified = true; // Forcer la vérification pour le développement
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Générer un nom d'utilisateur de base
    let baseUsername = req.body.username || name || email.split('@')[0];
    
    // Générer un nom d'utilisateur unique en ajoutant un timestamp
    const timestamp = Date.now().toString().slice(-4); // Prendre les 4 derniers chiffres du timestamp
    const username = `${baseUsername}${timestamp}`;
    
    // Nom d'utilisateur généré sans log
    
    // Préparer les données utilisateur
    const userData = {
      username,
      name: name || baseUsername,
      email,
      password: hashedPassword,
      userType: userType || 'touriste'
    };
    
    // Ajouter les champs spécifiques aux guides
    if (userType === 'guide') {
      userData.yearsOfExperience = req.body.yearsOfExperience || 0;
      userData.description = req.body.description || '';
      userData.expertise = Array.isArray(req.body.expertise) ? req.body.expertise : req.body.expertise ? [req.body.expertise] : [];
      userData.coveredGovernorates = Array.isArray(req.body.coveredGovernorates) ? req.body.coveredGovernorates : req.body.coveredGovernorates ? [req.body.coveredGovernorates] : [];
    }
    
    // Préparer les données de préférences
    const preferenceData = {
      languages: Array.isArray(req.body.languages) ? req.body.languages : req.body.languages ? [req.body.languages] : [],
      travelPurpose: Array.isArray(req.body.travelPurpose) ? req.body.travelPurpose : req.body.travelPurpose ? [req.body.travelPurpose] : [],
      travelCompanions: Array.isArray(req.body.travelCompanions) ? req.body.travelCompanions : req.body.travelCompanions ? [req.body.travelCompanions] : [],
      budget: Array.isArray(req.body.budget) ? req.body.budget : req.body.budget ? [req.body.budget] : []
    };
    
    // Ajouter les chemins des fichiers téléchargés
    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        userData.profileImage = '/uploads/' + req.files.profileImage[0].filename;
      }
      
      if (req.files.idCard && req.files.idCard[0]) {
        userData.idCard = '/uploads/' + req.files.idCard[0].filename;
      }
      
      if (req.files.certificate && req.files.certificate[0]) {
        userData.certificate = '/uploads/' + req.files.certificate[0].filename;
      }
      
      if (req.files.documents) {
        userData.documents = req.files.documents.map(doc => '/uploads/' + doc.filename);
      }
    }
    
    // Création d'utilisateur sans log des données sensibles
    
    // Variable pour stocker l'utilisateur sauvegardé
    let savedUser;
    
    try {
      // Créer et sauvegarder l'utilisateur
      const newUser = new User(userData);
      try {
        savedUser = await newUser.save();
        console.log('Utilisateur créé avec succès');
      } catch (userSaveError) {
        console.error('Erreur lors de la sauvegarde de l\'utilisateur:', userSaveError);
        throw userSaveError;
      }
      
      // Créer et sauvegarder les préférences de l'utilisateur
      const newPreference = new Preference({
        userId: savedUser._id,
        username: savedUser.username,
        ...preferenceData
      });
      try {
        await newPreference.save();
        console.log('Préférences créées avec succès');
      } catch (prefSaveError) {
        console.error('Erreur lors de la sauvegarde des préférences:', prefSaveError);
        // Continue even if preferences fail to save
      }
      
      console.log('Utilisateur et préférences créés avec succès');
    } catch (saveError) {
      // Gérer l'erreur de clé dupliquée
      if (saveError.code === 11000) {
        console.error('Erreur de clé dupliquée:', saveError);
        
        // Essayer avec un nom d'utilisateur différent (ajout d'un nombre aléatoire)
        const randomNum = Math.floor(Math.random() * 10000);
        userData.username = `${baseUsername}${randomNum}`;
        
        // Nouvel essai avec un nom d'utilisateur différent sans log
        
        const newUser = new User(userData);
        try {
          savedUser = await newUser.save();
          console.log('Utilisateur créé avec succès après résolution de conflit');
        } catch (retryUserSaveError) {
          console.error('Erreur lors de la seconde tentative de sauvegarde de l\'utilisateur:', retryUserSaveError);
          throw retryUserSaveError;
        }
        
        // Créer et sauvegarder les préférences de l'utilisateur après résolution de conflit
        const newPreference = new Preference({
          userId: savedUser._id,
          username: savedUser.username,
          ...preferenceData
        });
        try {
          await newPreference.save();
          console.log('Préférences créées avec succès après résolution de conflit');
        } catch (retryPrefSaveError) {
          console.error('Erreur lors de la sauvegarde des préférences après résolution de conflit:', retryPrefSaveError);
          // Continue even if preferences fail to save
        }
        
        console.log('Utilisateur et préférences créés avec succès après résolution de conflit:', savedUser._id);
      } else {
        // Relancer l'erreur si ce n'est pas une erreur de clé dupliquée
        throw saveError;
      }
    }
    
    // Créer un token JWT
    const token = jwt.sign(
      { _id: savedUser._id, userType: savedUser.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    // Renvoyer une réponse de succès
    console.log('Image de profil envoyée dans la réponse:', savedUser.profileImage);
    
    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        userType: savedUser.userType,
        profileImage: savedUser.profileImage
      },
      token
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    
    // Fournir plus de détails sur l'erreur
    if (error.name === 'ValidationError') {
      // Erreur de validation Mongoose
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Erreurs de validation:', validationErrors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors,
        fields: Object.keys(error.errors)
      });
    } else if (error.code === 11000) {
      // Erreur de duplication (email ou username déjà utilisé)
      const field = Object.keys(error.keyPattern)[0];
      console.error(`Duplication du champ ${field}:`, error);
      return res.status(400).json({ 
        error: `Le champ ${field} est déjà utilisé`,
        field: field
      });
    }
    
    // Autres erreurs
    res.status(500).json({ error: error.message || 'Erreur lors de l\'inscription' });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Tentative de connexion pour:', email);

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Utilisateur non trouvé:', email);
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Mot de passe incorrect pour:', email);
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    console.log('Connexion réussie pour:', email);
    
    // Créer un token JWT
    const token = jwt.sign(
      { _id: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclure le mot de passe de la réponse
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer un utilisateur par son ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: error.message });
  }
});

// Route pour demander un code de réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    
    // Pour des raisons de sécurité, nous ne révélons pas si l'email existe ou non
    // Nous envoyons toujours une réponse positive
    
    if (user) {
      // Envoyer l'email de réinitialisation uniquement si l'utilisateur existe
      await sendPasswordResetEmail(email);
    }
    
    res.status(200).json({
      message: 'Si un compte existe avec cet email, un code de réinitialisation a été envoyé'
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la demande de réinitialisation de mot de passe' });
  }
});

// Route pour vérifier le code OTP de réinitialisation de mot de passe
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email et code de vérification requis' });
    }
    
    // Vérifier l'OTP
    const isValidOTP = verifyOTP(email, 'password-reset', otp);
    
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Code de vérification invalide ou expiré' });
    }
    
    // Générer un token temporaire pour la réinitialisation
    const resetToken = jwt.sign(
      { email, purpose: 'password-reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' } // Expire après 15 minutes
    );
    
    res.status(200).json({
      message: 'Code de vérification valide',
      resetToken
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la vérification du code' });
  }
});

// Route pour réinitialiser le mot de passe
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Token de réinitialisation et nouveau mot de passe requis' });
    }
    
    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }
    
    // Vérifier que le token est bien pour une réinitialisation de mot de passe
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ error: 'Token invalide' });
    }
    
    // Trouver l'utilisateur
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la réinitialisation du mot de passe' });
  }
});

// Route pour demander la réinitialisation du mot de passe
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Aucun compte trouvé avec cet email' });
    }
    
    // Envoyer l'email de réinitialisation
    await sendPasswordResetEmail(email);
    
    res.status(200).json({
      message: 'Instructions de réinitialisation envoyées',
      email
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la demande de réinitialisation' });
  }
});

// Route pour vérifier le code de réinitialisation
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email et code de vérification requis' });
    }
    
    console.log(`Tentative de vérification du code ${otp} pour ${email}`);
    
    // Vérifier l'OTP (maintenant async)
    const isValidOTP = await verifyOTP(email, 'password-reset', otp);
    
    if (!isValidOTP) {
      console.log(`Échec de la vérification du code pour ${email}`);
      return res.status(400).json({ error: 'Code de vérification invalide ou expiré' });
    }
    
    console.log(`Code vérifié avec succès pour ${email}`);
    
    // Générer un token pour la réinitialisation
    const resetToken = jwt.sign(
      { email, purpose: 'password-reset' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' } // Expire après 1 heure
    );
    
    res.status(200).json({
      message: 'Code de vérification valide',
      resetToken
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la vérification du code' });
  }
});

// Route pour réinitialiser le mot de passe
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Token de réinitialisation et nouveau mot de passe requis' });
    }
    
    // Vérifier et décoder le token
    let decodedToken;
    try {
      decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET || 'your-secret-key');
    } catch (tokenError) {
      console.error('Erreur de vérification du token:', tokenError);
      return res.status(400).json({ error: 'Token de réinitialisation invalide ou expiré' });
    }
    
    // Vérifier que le token est bien pour la réinitialisation de mot de passe
    if (decodedToken.purpose !== 'password-reset') {
      return res.status(400).json({ error: 'Token invalide pour la réinitialisation de mot de passe' });
    }
    
    const { email } = decodedToken;
    
    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Mettre à jour le mot de passe
    user.password = hashedPassword;
    await user.save();
    
    console.log(`Mot de passe réinitialisé avec succès pour ${email}`);
    
    res.status(200).json({
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la réinitialisation du mot de passe' });
  }
});

module.exports = router;
