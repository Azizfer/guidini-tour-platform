const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
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
const groupRoutes = require('./routes/groupRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
// Removed duplicate test routes import since we have testKonnectRoutes
const profileRoutes = require('./routes/profile'); // Add profile routes
const guideToursRoutes = require('./routes/guideToursRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
// Removed recommendation routes import since the file doesn't exist
const adminGuidesRoutes = require('./routes/adminGuides');
const app = express();
const httpServer = createServer(app);

// Middleware for CORS - Enhanced for better frontend-backend communication
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
app.use(cors({
  origin: FRONTEND_URL, // Allow only the frontend origin
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature', 'Accept', 'X-Requested-With'], // Allowed headers
  exposedHeaders: ['Content-Length', 'X-Total-Count'] // Expose these headers to the frontend
}));

// Add preflight OPTIONS handling for all routes (with same CORS config)
app.options('*', cors({ origin: FRONTEND_URL, credentials: true }));

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

// Static uploads removed — all assets now served from Cloudinary

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

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
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

// Public test routes (no auth required)
app.use('/api/test', testRoutes); // Add test routes for diagnostics without auth
app.use('/api/recommendations', recommendationRoutes);

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Définir les routes avant de démarrer le serveur
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/tour-reviews', tourReviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/test-konnect', testKonnectRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/users', userRoutes);
// Public destinations route placed early to avoid auth middleware on generic /api routers below
app.use('/api/destinations', destinationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/guides', guideToursRoutes);
app.use('/api', guideStatsRoutes);
app.use('/api', reservationRoutes); // Add reservation routes
app.use('/api/groups', groupRoutes); // Add group routes
app.use('/api/profiles', profileRoutes); // Add profile routes
app.use('/api/memories', memoryRoutes);
app.use('/api/admin/guides', adminGuidesRoutes);

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Handle authentication
  socket.on('authenticate', (token) => {
    // Verify token logic here
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Connect to MongoDB
const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Guidini';

// Connect to MongoDB without logging
mongoose.connect(dbUri)
  .then(() => {
    // Only start the server after successfully connecting to MongoDB
    const PORT = process.env.PORT || 5001;
    
    // Start the server with Socket.io
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.error('Please make sure MongoDB is running and accessible');
    process.exit(1); // Exit the process if MongoDB connection fails
  });