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

// Route de test pour vérifier la connexion
router.get('/test', (req, res) => {
  console.log('Route de test auth appelée');
  res.status(200).json({ message: 'Auth API est accessible!', timestamp: new Date().toISOString() });
});

// Route de test pour vérifier la connexion à la base de données
router.get('/test-db', async (req, res) => {
  try {
    console.log('Test de connexion à la base de données...');
    
    // Compter le nombre d'utilisateurs pour vérifier la connexion à la base de données
    const userCount = await User.countDocuments();
    
    console.log(`Connexion à la base de données réussie. Nombre d'utilisateurs: ${userCount}`);
    
    // Renvoyer les informations sur la connexion à la base de données
    res.status(200).json({
      success: true,
      message: 'Connexion à la base de données réussie',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors du test de connexion à la base de données:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test de connexion à la base de données',
      error: error.message
    });
  }
});

// Route de test pour vérifier la fonctionnalité de connexion
router.get('/test-login', async (req, res) => {
  try {
    console.log('Test de la fonctionnalité de connexion...');
    
    // Rechercher un utilisateur dans la base de données pour tester
    const testUser = await User.findOne();
    
    if (!testUser) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur trouvé dans la base de données pour tester la connexion'
      });
    }
    
    console.log('Utilisateur de test trouvé:', {
      id: testUser._id,
      email: testUser.email,
      name: testUser.name,
      userType: testUser.userType
    });
    
    // Générer un token JWT pour l'utilisateur de test
    const token = jwt.sign(
      { _id: testUser._id, userType: testUser.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    // Renvoyer les informations sur l'utilisateur de test
    res.status(200).json({
      success: true,
      message: 'Test de connexion réussi',
      user: {
        _id: testUser._id,
        name: testUser.name,
        email: testUser.email,
        userType: testUser.userType,
        profileImage: testUser.profileImage
      },
      token,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors du test de connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test de connexion',
      error: error.message
    });
  }
});

// Route pour vérifier si un email ou nom d'utilisateur existe déjà
router.post('/check-email', async (req, res) => {
  try {
    const { email, username } = req.body;
    
    // Normaliser l'email (convertir en minuscules et supprimer les espaces)
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email requis pour la vérification' });
    }
    
    console.log('Vérification de l\'email:', normalizedEmail);
    
    // Vérifier si l'email existe déjà
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      console.log('Email déjà utilisé:', normalizedEmail);
      return res.status(400).json({ error: 'Cette adresse email est déjà utilisée' });
    }
    
    // Vérifier si le nom d'utilisateur existe déjà (si fourni)
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        console.log('Nom d\'utilisateur déjà utilisé:', username);
        return res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà utilisé' });
      }
    }
    
    // Si aucun doublon trouvé, renvoyer un succès
    console.log('Email et nom d\'utilisateur disponibles');
    res.status(200).json({ message: 'Email et nom d\'utilisateur disponibles' });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

// Route de pré-inscription pour envoyer un code de vérification
router.post('/pre-register', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Normaliser l'email (convertir en minuscules et supprimer les espaces)
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email requis pour la pré-inscription' });
    }
    
    console.log('Pré-inscription pour:', normalizedEmail);
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('Email déjà utilisé lors de la pré-inscription:', normalizedEmail);
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Envoyer l'email de vérification
    await sendVerificationEmail(normalizedEmail, name || 'Utilisateur');
    
    console.log('Code de vérification envoyé à:', normalizedEmail);
    
    res.status(200).json({
      message: 'Code de vérification envoyé',
      email: normalizedEmail
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
    
    // Normaliser l'email (convertir en minuscules et supprimer les espaces)
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    
    if (!normalizedEmail || !otp) {
      return res.status(400).json({ error: 'Email et code de vérification requis' });
    }
    
    console.log(`Tentative de vérification du code ${otp} pour ${normalizedEmail}`);
    
    // Vérifier l'OTP
    const isValidOTP = await verifyOTP(normalizedEmail, 'registration', otp);
    
    if (!isValidOTP) {
      console.log(`Échec de la vérification du code pour ${normalizedEmail}`);
      return res.status(400).json({ error: 'Code de vérification invalide ou expiré' });
    }
    
    console.log(`Code vérifié avec succès pour ${normalizedEmail}`);
    
    // Générer un token pour l'inscription
    const verificationToken = jwt.sign(
      { email: normalizedEmail, purpose: 'registration' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' } // Expire après 1 heure
    );
    
    res.status(200).json({
      message: 'Code de vérification valide',
      verificationToken
    });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la vérification du code' });
  }
});

// Route d'inscription (après vérification)
router.post('/register', uploadFields, async (req, res) => {
  try {
    // Supprimer le log des données d'inscription pour des raisons de sécurité
    
    const { email, password, name, userType, verificationToken } = req.body;
    
    // Normaliser l'email (convertir en minuscules et supprimer les espaces)
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    
    // Vérifier les champs obligatoires
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    console.log('Tentative d\'inscription pour:', normalizedEmail);
    
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
        if (decoded.email !== normalizedEmail) {
          console.log('Email dans le token ne correspond pas à l\'email fourni:', decoded.email, normalizedEmail);
          return res.status(400).json({ error: 'Token de vérification invalide pour cet email' });
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
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('Email déjà utilisé lors de l\'inscription:', normalizedEmail);
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Générer un nom d'utilisateur de base
    let baseUsername = req.body.username || name || normalizedEmail.split('@')[0];
    
    // Générer un nom d'utilisateur unique en ajoutant un timestamp
    const timestamp = Date.now().toString().slice(-4); // Prendre les 4 derniers chiffres du timestamp
    const username = `${baseUsername}${timestamp}`;
    
    // Nom d'utilisateur généré sans log
    
    // Préparer les données utilisateur
    const userData = {
      username,
      name: name || baseUsername,
      email: normalizedEmail, // Utiliser l'email normalisé
      password: password, // Utiliser le mot de passe non hashé, le hook pre-save se chargera du hashage
      userType: userType || 'touriste'
    };
    
    console.log('Création d\'un nouvel utilisateur avec l\'email:', normalizedEmail);
    
    // Ajouter les champs spécifiques aux guides
    if (userType === 'guide') {
      userData.yearsOfExperience = req.body.yearsOfExperience || 0;
      userData.description = req.body.description || '';
      
      // Convertir les expertises en français
      const expertiseMapping = {
        'history': 'histoire',
        'culture': 'culture',
        'gastronomy': 'gastronomie',
        'nature': 'nature',
        'adventure': 'aventure',
        'art': 'art',
        'architecture': 'architecture',
        'religion': 'religion',
        'beach': 'plage',
        'mountain': 'montagne',
        'desert': 'désert',
        'sport': 'sport',
        'shopping': 'shopping',
        'photography': 'photographie',
        'crafts': 'artisanat'
      };
      
      // Traiter les expertises pour les stocker en français
      const rawExpertise = Array.isArray(req.body.expertise) ? req.body.expertise : req.body.expertise ? [req.body.expertise] : [];
      userData.expertise = rawExpertise.map(exp => {
        const lowerExp = exp.toLowerCase();
        return expertiseMapping[lowerExp] || (Object.values(expertiseMapping).includes(lowerExp) ? lowerExp : 'culture');
      });
      
      // Stocker les gouvernorats couverts
      userData.coveredGovernorates = Array.isArray(req.body.coveredGovernorates) ? req.body.coveredGovernorates : req.body.coveredGovernorates ? [req.body.coveredGovernorates] : [];
      
      // Ajouter les langues directement dans le modèle guide (texte complet, pas d'abréviations)
      const languageMapping = {
        'fr': 'français',
        'en': 'anglais',
        'ar': 'arabe',
        'de': 'allemand',
        'es': 'espagnol',
        'it': 'italien',
        'ru': 'russe',
        'zh': 'chinois',
        'ja': 'japonais',
        'pt': 'portugais',
        'nl': 'néerlandais',
        'tr': 'turc'
      };
      
      // Traiter les langues pour les stocker en texte complet
      const rawLanguages = Array.isArray(req.body.languages) ? req.body.languages : req.body.languages ? [req.body.languages] : [];
      userData.languages = rawLanguages.map(lang => {
        const lowerLang = lang.toLowerCase();
        return languageMapping[lowerLang] || (Object.values(languageMapping).includes(lowerLang) ? lowerLang : 'français');
      });
    }
    
    // Préparer les données de préférences (uniquement pour les touristes)
    const preferenceData = {
      travelPurpose: Array.isArray(req.body.travelPurpose) ? req.body.travelPurpose : req.body.travelPurpose ? [req.body.travelPurpose] : [],
      travelCompanions: Array.isArray(req.body.travelCompanions) ? req.body.travelCompanions : req.body.travelCompanions ? [req.body.travelCompanions] : [],
      budget: Array.isArray(req.body.budget) ? req.body.budget : req.body.budget ? [req.body.budget] : []
    };
    
    // Pour les touristes, convertir les langues en texte complet
    if (userType !== 'guide') {
      const languageMapping = {
        'fr': 'français',
        'en': 'anglais',
        'ar': 'arabe',
        'de': 'allemand',
        'es': 'espagnol',
        'it': 'italien',
        'ru': 'russe',
        'zh': 'chinois',
        'ja': 'japonais',
        'pt': 'portugais',
        'nl': 'néerlandais',
        'tr': 'turc'
      };
      
      const rawLanguages = Array.isArray(req.body.languages) ? req.body.languages : req.body.languages ? [req.body.languages] : [];
      preferenceData.languages = rawLanguages.map(lang => {
        const lowerLang = lang.toLowerCase();
        return languageMapping[lowerLang] || (Object.values(languageMapping).includes(lowerLang) ? lowerLang : 'français');
      });
    }
    
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
      
      // Créer et sauvegarder les préférences de l'utilisateur (uniquement pour les touristes)
      if (userType !== 'guide') {
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
      } else {
        console.log('Utilisateur guide créé avec succès - pas de préférences séparées sauvegardées');
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
        
        // Créer et sauvegarder les préférences de l'utilisateur après résolution de conflit (uniquement pour les touristes)
        if (userType !== 'guide') {
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
        } else {
          console.log('Utilisateur guide créé avec succès après résolution de conflit - pas de préférences séparées sauvegardées');
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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Normaliser l'email (convertir en minuscules et supprimer les espaces)
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email requis pour la connexion' });
    }
    
    console.log('Tentative de connexion pour:', normalizedEmail);

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('Utilisateur non trouvé pour:', normalizedEmail);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Mot de passe incorrect pour:', normalizedEmail);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Créer un token JWT
    const token = jwt.sign(
      { _id: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    console.log('Connexion réussie pour:', normalizedEmail);

    // Renvoyer une réponse de succès
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        profileImage: user.profileImage
      },
      message: 'Connexion réussie'
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la connexion' });
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
    
    // Normaliser l'email (convertir en minuscules et supprimer les espaces)
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email requis pour la réinitialisation du mot de passe' });
    }
    
    console.log('Demande de réinitialisation de mot de passe pour:', normalizedEmail);
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('Aucun compte trouvé avec cet email:', normalizedEmail);
      return res.status(404).json({ error: 'Aucun compte trouvé avec cet email' });
    }
    
    // Envoyer l'email de réinitialisation
    await sendPasswordResetEmail(normalizedEmail);
    
    console.log('Instructions de réinitialisation envoyées à:', normalizedEmail);
    
    res.status(200).json({
      message: 'Instructions de réinitialisation envoyées',
      email: normalizedEmail
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
    
    // Normaliser l'email (convertir en minuscules et supprimer les espaces)
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    
    if (!normalizedEmail || !otp) {
      return res.status(400).json({ error: 'Email et code de vérification requis' });
    }
    
    console.log(`Tentative de vérification du code ${otp} pour ${normalizedEmail}`);
    
    // Vérifier l'OTP (maintenant async)
    const isValidOTP = await verifyOTP(normalizedEmail, 'password-reset', otp);
    
    if (!isValidOTP) {
      console.log(`Échec de la vérification du code pour ${normalizedEmail}`);
      return res.status(400).json({ error: 'Code de vérification invalide ou expiré' });
    }
    
    console.log(`Code vérifié avec succès pour ${normalizedEmail}`);
    
    // Générer un token pour la réinitialisation
    const resetToken = jwt.sign(
      { email: normalizedEmail, purpose: 'password-reset' },
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
    
    // Récupérer l'email du token et s'assurer qu'il est normalisé
    const email = decodedToken.email;
    const normalizedEmail = email ? email.trim().toLowerCase() : null;
    
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email invalide dans le token' });
    }
    
    console.log(`Tentative de réinitialisation de mot de passe pour: ${normalizedEmail}`);
    
    // Trouver l'utilisateur
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`Utilisateur non trouvé pour: ${normalizedEmail}`);
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
