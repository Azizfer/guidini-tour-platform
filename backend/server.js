const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const tourRoutes = require('./routes/tourRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const testKonnectRoutes = require('./routes/testKonnect');
const preferenceRoutes = require('./routes/preferences');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const app = express();

// Middleware for CORS - Enhanced for better frontend-backend communication
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow frontend domains
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature', 'Accept'], // Allowed headers
  exposedHeaders: ['Content-Length', 'X-Total-Count'] // Expose these headers to the frontend
}));

// Middleware pour parser le JSON et les données de formulaire
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis le dossier uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Dossier uploads configuré pour les fichiers statiques:', path.join(__dirname, 'uploads'));

// Afficher les données reçues pour le débogage
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('Requête POST reçue sur:', req.originalUrl);
    console.log('Type de contenu:', req.headers['content-type']);
    console.log('Corps de la requête:', req.body);
  }
  next();
});

// Middleware spécial pour le webhook Stripe (si nécessaire)
app.use('/api/payment/stripe/webhook', (req, res, next) => {
  // Pour Stripe, on utilise le body raw
  const rawBody = [];
  req.on('data', (chunk) => {
    rawBody.push(chunk);
  });
  req.on('end', () => {
    req.rawBody = Buffer.concat(rawBody);
    next();
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Définir les routes avant de démarrer le serveur
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/test', testKonnectRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Connect to MongoDB
const dbUri = process.env.MONGODB_URI;

// Vérifier si l'URI MongoDB est défini
if (!dbUri) {
  console.error('ERREUR: MONGODB_URI n\'est pas défini dans le fichier .env');
  console.error('Veuillez créer un fichier .env avec une variable MONGODB_URI valide');
  console.error('Exemple: MONGODB_URI=mongodb://localhost:27017/guidini');
  process.exit(1);
}

const dbName = dbUri.split('/').pop().split('?')[0]; // Extraire le nom de la base de données de l'URI

// Connect to MongoDB without verbose logging
mongoose.connect(dbUri)
  .then(() => {
    // Only start the server after successfully connecting to MongoDB
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      // Server is running on PORT
    });
  })
  .catch((err) => {
    console.error('ERREUR de connexion MongoDB:', err);
    console.error('Veuillez vérifier que:');
    console.error('1. MongoDB est installé et en cours d\'exécution');
    console.error('2. L\'URI dans le fichier .env est correct');
    console.error('3. Les identifiants de connexion sont valides');
    process.exit(1); // Exit the process if MongoDB connection fails
  });
