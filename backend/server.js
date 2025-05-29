const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const tourRoutes = require('./routes/tourRoutes');
const tourReviewRoutes = require('./routes/tourReviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const testKonnectRoutes = require('./routes/testKonnect');
const preferenceRoutes = require('./routes/preferences');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notificationRoutes');
const ratingRoutes = require('./routes/ratings');
const guideRoutes = require('./routes/guides');
const guideStatsRoutes = require('./routes/guideStatsRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const app = express();

// Middleware for CORS - Enhanced for better frontend-backend communication
app.use(cors({
  origin: '*', // Allow all origins during development
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature', 'Accept', 'X-Requested-With'], // Allowed headers
  exposedHeaders: ['Content-Length', 'X-Total-Count'] // Expose these headers to the frontend
}));

// Add preflight OPTIONS handling for all routes
app.options('*', cors());

// Middleware pour parser le JSON et les données de formulaire
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add error handling for file uploads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 413) {
    console.error('Request entity too large');
    return res.status(413).json({ error: 'Fichier trop volumineux. La taille maximale est de 50MB.' });
  }
  next(err);
});

// Servir les fichiers statiques depuis le dossier uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware de traitement des requêtes
app.use((req, res, next) => {
  // Capture original console.log to restore later
  const originalLog = console.log;
  
  // Override console.log to filter out placeholder.svg 404 logs
  console.log = function(...args) {
    const logString = args.join(' ');
    if (!logString.includes('GET /placeholder.svg 404')) {
      originalLog.apply(console, args);
    }
  };
  
  // Continue with request
  next();
  
  // Restore original console.log after request is handled
  console.log = originalLog;
});

// Supprimer les logs d'erreur JWT
process.on('unhandledRejection', (reason, promise) => {
  // Ignorer silencieusement les erreurs de JWT
  if (reason && reason.name === 'TokenExpiredError') {
    return;
  }
  // Gérer les autres erreurs normalement
});

// Supprimer les logs d'erreur non gérées
process.on('uncaughtException', (error) => {
  // Ignorer silencieusement les erreurs de JWT
  if (error && error.name === 'TokenExpiredError') {
    return;
  }
  // Gérer les autres erreurs normalement
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
app.use('/api/tour-reviews', tourReviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/test', testKonnectRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api', guideStatsRoutes);
app.use('/api', reservationRoutes); // Add reservation routes

// Connect to MongoDB
const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/guidini';

// Connect to MongoDB without verbose logging
mongoose.connect(dbUri)
  .then(() => {
    // Only start the server after successfully connecting to MongoDB
    const PORT = process.env.PORT || 5001;
    
    // Start the server without Socket.io
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if MongoDB connection fails
  });
