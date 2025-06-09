const Payment = require('../models/payment');
const User = require('../models/User');
const Tour = require('../models/Tour');
const Notification = require('../models/Notification');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// Konnect API configuration
// Load environment variables if not already loaded
require('dotenv').config();

// Utiliser l'URL de base de l'API Konnect (environnement sandbox)
const KONNECT_API_URL = process.env.KONNECT_API_URL || 'https://api.konnect.network';

// La clé API Konnect au format 'ID:SECRET' doit être utilisée telle quelle dans l'en-tête 'x-api-key'
// Si la clé n'est pas définie dans les variables d'environnement, utiliser une clé de test
const KONNECT_API_KEY = process.env.KONNECT_API_KEY || 'test_ID:test_SECRET';

// ID du portefeuille du destinataire (à définir dans les variables d'environnement)
const RECEIVER_WALLET_ID = process.env.RECEIVER_WALLET_ID || 'test_wallet_id';

// URL de base du backend pour les webhooks et redirections
const BACKEND_URL = process.env.BACKEND_URL || 'https://api.guidini.tn';

// URL de redirection après paiement (frontend)
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://guidini.tn';

// Initialize payment with Konnect
exports.initializePayment = async (req, res) => {
  try {
    const {
      amount,
      description,
      firstName,
      lastName,
      phoneNumber,
      email,
      orderId,
      tourId,
      userId
    } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ message: 'Amount and description are required' });
    }

    // Prepare the payment request payload
    const paymentData = {
      receiverWalletId: RECEIVER_WALLET_ID,
      token: "TND",
      amount: parseInt(amount * 1000), // Convert to millimes (Konnect expects amount in millimes)
      type: "immediate",
      description: description,
      acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
      lifespan: 60, // Payment link valid for 60 minutes
      checkoutForm: true,
      addPaymentFeesToAmount: true,
      firstName: firstName || '',
      lastName: lastName || '',
      phoneNumber: phoneNumber || '',
      email: email || '',

      orderId: orderId || `tour-${tourId}-${Date.now()}`,
      webhook: `${BACKEND_URL}/api/payments/webhook`,
      theme: "light",
      // Use frontend URLs for success and failure redirections
      successUrl: `${FRONTEND_URL}/payment/callback?payment_ref=${orderId || `tour-${tourId}-${Date.now()}`}&status=success`,
      failUrl: `${FRONTEND_URL}/payment/callback?payment_ref=${orderId || `tour-${tourId}-${Date.now()}`}&status=failure`
    };
    
    console.log('Initializing payment with Konnect:', {
      amount: amount,
      description: description,
      receiverWalletId: RECEIVER_WALLET_ID ? RECEIVER_WALLET_ID.substring(0, 5) + '...' : 'undefined',
      orderId: paymentData.orderId
    });

    // Make request to Konnect API with retry logic
    let response;
    let retryCount = 0;
    let lastError = null;
    const maxRetries = 3;
    
    // Log complete request details for debugging
    console.log('Complete payment request payload:', JSON.stringify(paymentData, null, 2));
    console.log('Complete API URL:', `${KONNECT_API_URL}/api/v2/payments/init-payment`);
    console.log('Complete headers:', {
      'x-api-key': KONNECT_API_KEY ? `${KONNECT_API_KEY.substring(0, 10)}...` : 'Missing',
      'Content-Type': 'application/json'
    });
    
    // Log user info from request for debugging
    console.log('User info from request:', req.user ? {
      _id: req.user._id,
      userType: req.user.userType
    } : 'No user in request');
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1} of ${maxRetries}`);
        
        // Add a small delay between retries (except for the first attempt)
        if (retryCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
        
        // Utiliser le bon chemin d'API pour Konnect
        console.log('Complete API URL:', `${KONNECT_API_URL}/api/v2/payments/init-payment`)
        // Afficher les en-têtes pour débogage
        console.log('Complete headers:', { 'x-api-key': KONNECT_API_KEY.substring(0, 10) + '...', 'Content-Type': 'application/json' })
        // Ensure the API URL is correct for sandbox environment
        const apiUrl = `${KONNECT_API_URL}/api/v2/payments/init-payment`;
        console.log('Making request to Konnect API:', apiUrl);
        
        response = await axios.post(
          apiUrl, 
          paymentData,
          {
            headers: {
              // La clé API Konnect au format 'ID:SECRET' doit être utilisée telle quelle
              'x-api-key': KONNECT_API_KEY ? KONNECT_API_KEY.trim() : '',
              'Content-Type': 'application/json'
            },
            // Ne pas suivre les redirections automatiquement
            maxRedirects: 0,
            // Afficher les détails complets de la requête pour débogage
            validateStatus: function (status) {
              // Accepter tous les codes d'état pour pouvoir les analyser
              return true;
            },
            timeout: 15000 // 15 seconds timeout
          }
        );
        
        // Log the complete response for debugging
        console.log('Complete Konnect API response:', JSON.stringify(response.data, null, 2));
        
        // Extract payUrl and paymentRef safely (may come in headers for 3xx response)
        let payUrl = response.data.payUrl || response.data.link || response.headers?.location || '';
        let paymentRef = response.data.paymentRef || response.data.payment_reference || response.headers?.paymentref || response.headers?.paymentRef || '';
        
        // If still missing, attempt to parse paymentRef from redirect URL
        if (!paymentRef && payUrl) {
          try {
            const urlObj = new URL(payUrl);
            paymentRef = urlObj.searchParams.get('paymentRef') || urlObj.searchParams.get('payment_ref') || '';
          } catch (e) {
            console.error('Failed to parse paymentRef from payUrl:', e.message);
          }
        }
        
        // If we have paymentRef but no explicit payUrl, build one using checkout base
        if (!payUrl && paymentRef) {
          const BASE_CHECKOUT = process.env.KONNECT_CHECKOUT_URL || `${KONNECT_API_URL}/payments/checkout`;
          payUrl = `${BASE_CHECKOUT}?paymentRef=${paymentRef}`;
        }
        
        // Log extracted values
        console.log('Parsed Konnect response -> payUrl:', payUrl, ' paymentRef:', paymentRef);
        
        // If we get here, the request was successful
        console.log('Payment initialization successful. Response:', {
          payUrl: payUrl,
          paymentRef: paymentRef,
          orderId: response.data.orderId || paymentData.orderId
        });
        
        // Attach extracted values to response for later steps
        response.data.payUrl = payUrl;
        response.data.paymentRef = paymentRef;
        
        break;
      } catch (retryError) {
        retryCount++;
        console.error(`Attempt ${retryCount} failed:`, retryError.message);
        
        // Log detailed error information
        if (retryError.response) {
          console.error('Error response status:', retryError.response.status);
          console.error('Error response data:', JSON.stringify(retryError.response.data, null, 2));
        } else if (retryError.request) {
          console.error('No response received from Konnect API');
        } else {
          console.error('Error details:', retryError);
        }
        
        // If we've reached max retries, throw the error
        if (retryCount === maxRetries) {
          lastError = retryError;
          throw retryError;
        }
      }
    }

    // Save payment reference to database
    try {
      console.log('Attempting to save payment to database with ref:', response.data.paymentRef);
      
      // Vérifier si la connexion MongoDB est active
      console.log('MongoDB connection state:', mongoose.connection.readyState);
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      
      // Éviter la duplication dans orderId
      let cleanOrderId = paymentData.orderId || '';
      if (cleanOrderId.startsWith('tour-tour-')) {
        cleanOrderId = cleanOrderId.replace('tour-tour-', 'tour-');
      }
      
      // Déboguer les données reçues pour comprendre pourquoi tourId est manquant
      console.log('Données de paiement reçues:', {
        tourIdFromBody: tourId,
        tourIdFromPaymentData: paymentData.tourId,
        orderId: orderId,
        userId: userId
      });
      
      // Récupérer l'ID du tour depuis toutes les sources possibles
      let cleanTourId = null;
      
      // Vérifier d'abord si tourId est fourni directement dans le corps de la requête
      if (tourId && tourId !== 'unknown') {
        console.log('TourId trouvé dans le corps de la requête:', tourId);
        cleanTourId = tourId;
      }
      // Sinon, vérifier si tourId est dans les données de paiement
      else if (paymentData.tourId && paymentData.tourId !== 'unknown') {
        console.log('TourId trouvé dans les données de paiement:', paymentData.tourId);
        cleanTourId = paymentData.tourId;
      }
      // Sinon, essayer d'extraire un tourId de l'orderId (si format tour-ID-timestamp)
      else if (orderId && orderId.startsWith('tour-')) {
        const parts = orderId.split('-');
        if (parts.length > 1) {
          const potentialTourId = parts[1];
          console.log('TourId potentiel extrait de l\'orderId:', potentialTourId);
          if (potentialTourId && potentialTourId !== 'unknown') {
            cleanTourId = potentialTourId;
          }
        }
      }
      
      // Si aucun tourId n'a été trouvé, utiliser 'unknown' comme dernier recours
      if (!cleanTourId) {
        console.log('Aucun tourId valide trouvé, utilisation de "unknown"');
        cleanTourId = 'unknown';
      }
      
      console.log('TourId final avant validation:', cleanTourId);
      
      // Vérifier que le tourId est un ObjectId valide
      if (cleanTourId && cleanTourId !== 'unknown') {
        try {
          // Vérifier si le tourId est un ObjectId valide
          if (!mongoose.Types.ObjectId.isValid(cleanTourId)) {
            console.log('TourId n\'est pas un ObjectId valide:', cleanTourId);
            // Essayer de trouver le tour par slug comme dernier recours
            const Tour = require('../models/Tour');
            const tour = await Tour.findOne({ slug: cleanTourId });
            if (tour) {
              console.log('Tour trouvé par slug, utilisation de l\'ID réel:', tour._id);
              cleanTourId = tour._id.toString();
            } else {
              console.log('Aucun tour trouvé pour le slug:', cleanTourId);
              cleanTourId = 'unknown';
            }
          } else {
            console.log('TourId est un ObjectId valide:', cleanTourId);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du tourId:', error);
          cleanTourId = 'unknown';
        }
      }
      
      // Create a new payment record
      const payment = new Payment({
        paymentRef: response.data.paymentRef,
        orderId: cleanOrderId,
        userId: req.user ? req.user._id : (userId || paymentData.userId ),
        tourId: cleanTourId,
        amount: amount,
        status: 'completed', // Changé de 'pending' à 'completed' pour déclencher les notifications immédiatement
        customerName: `${firstName || ''} ${lastName || ''}`.trim(),
        customerEmail: email || '',
        customerPhone: phoneNumber || '',
        participants: paymentData.participants || 1,
        reservationDate: paymentData.date ? new Date(paymentData.date) : new Date(),
        paymentMethod: 'konnect'
      });
      
      console.log('Payment object created:', JSON.stringify(payment, null, 2));

      // Save the payment to the database
      console.log('DEBUG: About to save payment with status:', payment.status);
      console.log('DEBUG: Payment tourId:', payment.tourId);
      const savedPayment = await payment.save();
      console.log('DEBUG: Payment record created successfully:', savedPayment.paymentRef);
      console.log('DEBUG: Payment ID in database:', savedPayment._id);
      console.log('DEBUG: Payment status after save:', savedPayment.status);
      
      // Si le paiement est complété, créer automatiquement des notifications
      console.log('Vérification du statut de paiement pour création de notifications:', savedPayment.status);
      if (savedPayment.status === 'completed') {
        console.log('Statut de paiement "completed" détecté, démarrage de la création de notifications');
        try {
          // Importer les modules nécessaires
          console.log('Import des modules nécessaires...');
          const Notification = require('../models/Notification');
          const mongoose = require('mongoose');
          console.log('Modules importés avec succès');
          
          // Préparer les notifications
          const notifications = [];
          
          // Create notifications for both user and guide
          try {
            console.log('Creating notifications for payment:', savedPayment.paymentRef);
            const notifications = [];
            
            // Create notification for the tourist (user)
            if (userId) {
              const recipientId = mongoose.Types.ObjectId.isValid(userId) 
                ? mongoose.Types.ObjectId(userId) 
                : userId;
              
              const tourObjectId = savedPayment.tourId && mongoose.Types.ObjectId.isValid(savedPayment.tourId)
                ? mongoose.Types.ObjectId(savedPayment.tourId)
                : undefined;
              
              console.log('Creating notification for tourist:', recipientId);
              
              // Check if a tourist notification already exists
              const existingTouristNotification = await Notification.findOne({
                recipient: recipientId,
                type: 'payment',
                tourId: tourObjectId,
                'createdAt': { $gte: new Date(Date.now() - 5 * 60 * 1000) }
              });
              
              if (!existingTouristNotification) {
                notifications.push({
                  recipient: recipientId,
                  title: "Paiement confirmé",
                  description: `Votre paiement de ${savedPayment.amount} TND pour la réservation a été confirmé.`,
                  type: "payment",
                  tourId: tourObjectId,
                  amount: savedPayment.amount,
                  read: false
                });
                console.log('Notification pour touriste ajoutée à la liste');
              } else {
                console.log('Tourist notification already exists, skipping creation');
              }
            } else {
              console.log('Pas d\'ID utilisateur valide pour créer une notification touriste');
            }
            
            // Notification pour le guide (si l'ID du tour est disponible, on peut récupérer l'ID du guide)
            console.log('Vérification de l\'ID du tour:', savedPayment.tourId);
            if (savedPayment.tourId && savedPayment.tourId !== 'unknown') {
              console.log('ID du tour valide, recherche des informations du tour...');
              try {
                // Importer le modèle de tour
                const Tour = require('../models/Tour');
                
                // Récupérer les informations du tour pour obtenir l'ID du guide
                console.log('Recherche du tour avec ID:', savedPayment.tourId);
                const tour = await Tour.findById(savedPayment.tourId);
                
                if (tour) {
                  console.log('Tour trouvé:', tour._id, 'Guide ID:', tour.guideId);
                  if (tour.guideId) {
                    console.log('Ajout d\'une notification pour le guide avec ID:', tour.guideId);
                    // Convertir les IDs en ObjectId si nécessaire
                    const guideId = mongoose.Types.ObjectId.isValid(tour.guideId)
                      ? mongoose.Types.ObjectId(tour.guideId)
                      : tour.guideId;
                      
                    const tourObjectId = mongoose.Types.ObjectId.isValid(savedPayment.tourId)
                      ? mongoose.Types.ObjectId(savedPayment.tourId)
                      : undefined;
                    
                    // Check if a guide notification already exists
                    const existingGuideNotification = await Notification.findOne({
                      recipient: guideId,
                      tourId: tourId,
                      'createdAt': { $gte: new Date(Date.now() - 5 * 60 * 1000) }
                    });
                    
                    if (!existingGuideNotification) {
                      const notification = await Notification.create({
                        recipient: guideId, // Use recipient instead of userId for consistency
                        type: 'reservation',
                        title: 'Nouvelle réservation',
                        description: `Vous avez reçu une nouvelle réservation pour ${tour.title || 'votre tour'}.`,
                        tourId: tourId, // Add tourId for better tracking
                        read: false
                      });
                      
                      console.log('Notification created for guide:', guideId);
                    } else {
                      console.log('Guide notification already exists, skipping creation');
                    }
                    
                    // Update the guide's stats (payments and tourists)
                    try {
                      console.log('Updating guide stats for guide:', guideId);
                      const GuideStats = require('../models/GuideStats');
                      
                      // Find or create stats document for this guide
                      let stats = await GuideStats.findOne({ guideId: guideId });
                      
                      if (!stats) {
                        console.log('No stats found for guide, creating new stats document');
                        stats = new GuideStats({ guideId: guideId });
                      }
                      
                      // Increment paymentsReceived count
                      stats.paymentsReceived += 1;
                      
                      // Increment tourists count based on participants
                      const participantsNum = savedPayment.participants || 1;
                      stats.touristsCount += participantsNum;
                      
                      // Also increment revenue if amount is available
                      if (savedPayment.amount) {
                        stats.totalRevenue += savedPayment.amount;
                      }
                      
                      // Save the updated stats
                      await stats.save();
                      
                      console.log(`Updated guide stats: paymentsReceived=${stats.paymentsReceived}, touristsCount=${stats.touristsCount}`);
                      
                      // Emit socket event if available
                      if (req.app.get('io')) {
                        const io = req.app.get('io');
                        io.emit('statsUpdate', { guideId: guideId.toString() });
                      }
                    } catch (statsError) {
                      console.error('Error updating guide stats:', statsError);
                    }
                  } else {
                    console.log('Le tour n\'a pas d\'ID de guide associé');
                  }
                } else {
                  console.log('Aucun tour trouvé avec cet ID');
                }
              } catch (tourError) {
                console.error('Erreur lors de la recherche du tour:', tourError);
              }
            } else {
              console.log('Pas d\'ID de tour valide pour créer une notification guide');
            }
            
            // Créer les notifications dans la base de données
            console.log('Nombre de notifications à créer:', notifications.length);
            if (notifications.length > 0) {
              console.log('Tentative d\'insertion des notifications dans la base de données...');
              try {
                const result = await Notification.insertMany(notifications);
                console.log('Résultat de l\'insertion:', result);
                console.log(`${notifications.length} notifications créées automatiquement pour le paiement ${savedPayment.paymentRef}`);
              } catch (insertError) {
                console.error('Erreur spécifique lors de l\'insertion des notifications:', insertError);
                if (insertError.name === 'ValidationError') {
                  console.error('Erreurs de validation:', insertError.errors);
                }
              }
            } else {
              console.log('Aucune notification à créer');
            }
          } catch (notifError) {
            console.error('Erreur générale lors de la création automatique des notifications:', notifError);
            console.error('Détails de l\'erreur:', notifError.message);
            console.error('Stack trace:', notifError.stack);
            // Ne pas bloquer le processus si la création de notifications échoue
          }
        } catch (notifError) {
          console.error('Erreur générale lors de la création automatique des notifications:', notifError);
          console.error('Détails de l\'erreur:', notifError.message);
          console.error('Stack trace:', notifError.stack);
          // Ne pas bloquer le processus si la création de notifications échoue
        }
      } else {
        console.log('Le statut du paiement n\'est pas "completed", aucune notification n\'est créée');
      }
    } catch (dbError) {
      console.error('Error saving payment to database:', dbError);
      console.error('Error details:', dbError.message);
      if (dbError.name === 'ValidationError') {
        console.error('Validation errors:', dbError.errors);
      }
      // Continue even if database save fails
    }

    // Return payment URL and reference
    res.json({
      success: !!response.data.payUrl && !!response.data.paymentRef,
      payUrl: response.data.payUrl || '',
      paymentRef: response.data.paymentRef || '',
      orderId: paymentData.orderId
    });
  } catch (error) {
    console.error('Error initializing payment:', error.message);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to initialize payment';
    let statusCode = 500;
    
    // Check if Konnect API key and wallet ID are properly set
    if (!KONNECT_API_KEY || !RECEIVER_WALLET_ID) {
      console.error('Missing required Konnect configuration');
      return res.status(500).json({
        success: false,
        message: 'Configuration du paiement incomplète. Veuillez contacter l\'administrateur.',
        errorCode: 'PAYMENT_CONFIG_MISSING'
      });
    }
    
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état hors de la plage 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Handle specific Konnect API errors
      const errorMessage = error.response.data?.message || 'Erreur lors de l\'initialisation du paiement';
      const errorCode = error.response.status;
      
      return res.status(errorCode).json({
        success: false,
        message: errorMessage,
        errorCode: 'KONNECT_API_ERROR',
        details: error.response.data
      });
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('No response received from Konnect API');
      return res.status(503).json({
        success: false,
        message: 'Le service de paiement est temporairement indisponible. Veuillez réessayer plus tard.',
        errorCode: 'PAYMENT_SERVICE_UNAVAILABLE'
      });
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Error message:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de l\'initialisation du paiement. Veuillez réessayer.',
        errorCode: 'PAYMENT_INIT_ERROR'
      });
    }
  }
};

// Get payment status from Konnect
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentRef } = req.params;

    if (!paymentRef) {
      return res.status(400).json({ message: 'Payment reference is required' });
    }

    // Make request to Konnect API to get payment status
    const response = await axios.get(
      `${KONNECT_API_URL}/api/v2/payments/${paymentRef}`,
      {
        headers: {
          'x-api-key': KONNECT_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return payment status to client
    return res.status(200).json({
      success: true,
      payment: response.data.payment
    });
  } catch (error) {
    console.error('Error getting payment status:', error.response?.data || error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment status',
      error: error.response?.data || error.message
    });
  }
};

// Handle Konnect webhook notifications
exports.handleWebhook = async (req, res) => {
  try {
    console.log('Webhook received:', {
      method: req.method,
      query: req.query,
      body: req.body,
      headers: req.headers
    });
    
    // Handle GET request (Konnect might be verifying the endpoint or redirecting users)
    if (req.method === 'GET') {
      console.log('Received GET request to webhook endpoint');
      
      // Check if this is a redirect from payment page with payment_ref
      if (req.query.payment_ref) {
        console.log('User redirected to webhook with payment_ref, redirecting to frontend');
        
        // Find the payment in the database
        try {
          const payment = await Payment.findOne({ paymentRef: req.query.payment_ref });
          
          if (payment) {
            console.log('Found payment:', payment);
            
            // Create notifications for the payment if status is completed
            if (payment.status === 'completed') {
              const Notification = require('../models/Notification');
              
              try {
                // Get tour details to find guide ID
                const Tour = require('../models/Tour');
                
                // Vérifier si le tourId est un ObjectId valide
                let tour = null;
                const mongoose = require('mongoose');
                
                console.log('Recherche du tour avec ID:', payment.tourId);
                
                // Vérifier si le tourId est un ObjectId valide
                if (mongoose.Types.ObjectId.isValid(payment.tourId)) {
                  console.log('tourId est un ObjectId valide, recherche du tour');
                  tour = await Tour.findById(payment.tourId);
                } else {
                  console.log('tourId n\'est pas un ObjectId valide:', payment.tourId);
                  // Essayer de trouver le tour par slug comme dernier recours
                  tour = await Tour.findOne({ slug: payment.tourId });
                  
                  // Si un tour est trouvé, mettre à jour le payment avec l'ID correct
                  if (tour) {
                    console.log('Tour trouvé par slug, mise à jour du payment avec l\'ID réel:', tour._id);
                    payment.tourId = tour._id.toString();
                    await payment.save();
                  }
                }
                
                if (!tour) {
                  console.log('Tour not found for payment:', payment.paymentRef, 'with tourId:', payment.tourId);
                } else {
                  const notifications = [];
                  
                  // Create notification for tourist
                  if (payment.userId) {
                    // Check if a tourist notification already exists
                    const existingTouristNotification = await Notification.findOne({
                      recipient: payment.userId,
                      type: 'payment',
                      tourId: payment.tourId,
                      'createdAt': { $gte: new Date(Date.now() - 5 * 60 * 1000) }
                    });
                    
                    if (!existingTouristNotification) {
                      notifications.push({
                        recipient: payment.userId,
                        title: 'Paiement confirmé',
                        description: `Votre paiement de ${payment.amount} TND pour la réservation a été confirmé.`,
                        type: 'payment',
                        tourId: payment.tourId,
                        amount: payment.amount,
                        read: false
                      });
                      console.log('Tourist payment notification added to list');
                    } else {
                      console.log('Tourist notification already exists, skipping creation');
                    }
                  } else if (paymentRecord && paymentRecord.userId) {
                    // Check if a tourist notification already exists
                    const existingTouristNotification = await Notification.findOne({
                      recipient: paymentRecord.userId,
                      type: 'payment',
                      tourId: tourId,
                      'createdAt': { $gte: new Date(Date.now() - 5 * 60 * 1000) }
                    });
                    
                    if (!existingTouristNotification) {
                      notifications.push({
                        recipient: paymentRecord.userId,
                        title: 'Paiement confirmé',
                        description: `Votre paiement de ${paymentRecord.amount} TND pour la réservation a été confirmé.`,
                        type: 'payment',
                        tourId: tourId,
                        amount: paymentRecord.amount,
                        read: false
                      });
                      console.log('Tourist payment notification added to list from payment record');
                    } else {
                      console.log('Tourist notification already exists, skipping creation');
                    }
                  }
                  
                  // Create notification for guide
                  if (tour.guideId) {
                    // Check if a notification already exists for this payment/reservation
                    const existingNotification = await Notification.findOne({
                      recipient: tour.guideId,
                      tourId: tour.tourId,
                      'createdAt': { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Check for notifications in the last 5 minutes
                    });
                    
                    if (!existingNotification) {
                      notifications.push({
                        recipient: tour.guideId,
                        title: 'Nouvelle réservation',
                        description: `Vous avez reçu une nouvelle réservation pour ${tour.title || 'votre tour'}.`,
                        type: 'reservation',
                        tourId: tour.tourId,
                        userId: payment.userId,
                        amount: payment.amount
                      });
                    } else {
                      console.log('Notification already exists for this reservation, skipping creation');
                    }
                  }
                  
                  console.log('Nombre de notifications à créer:', notifications.length);
                  
                  if (notifications.length > 0) {
                    const result = await Notification.insertMany(notifications);
                    console.log(`${notifications.length} notifications créées pour le paiement ${payment.paymentRef}`);
                  } else {
                    console.log('Aucune notification à créer');
                  }
                  
                  // Payment has been processed successfully
                }
              } catch (notifError) {
                console.error('Error creating notifications:', notifError);
              }
            }
            
            // Redirect to frontend with payment reference and status
            return res.redirect(`${FRONTEND_URL}/payment/callback?payment_ref=${req.query.payment_ref}&status=${payment.status}`);
          } else {
            console.log('Payment not found for ref:', req.query.payment_ref);
            // Redirect to frontend with payment reference but unknown status
            return res.redirect(`${FRONTEND_URL}/payment/callback?payment_ref=${req.query.payment_ref}&status=unknown`);
          }
        } catch (error) {
          console.error('Error processing payment redirect:', error);
          // Redirect to frontend with error
          return res.redirect(`${FRONTEND_URL}/payment/callback?error=true`);
        }
      }
      
      // This is just a verification of the webhook endpoint if no payment_ref
      return res.status(200).json({ success: true, message: 'Webhook endpoint is active' });
    }
    
    // Handle POST request with payment data
    const webhookData = req.body;
    
    // Verify webhook signature (if Konnect provides this)
    // ...

    // Process the payment notification
    const { payment } = webhookData;
    
    if (!payment) {
      console.log('Invalid webhook data received:', webhookData);
      return res.status(400).json({ message: 'Invalid webhook data' });
    }

    console.log('Processing payment webhook:', {
      paymentRef: payment.paymentRef,
      status: payment.status,
      amount: payment.amount,
      orderId: payment.orderId
    });

    // Update payment status in the database
    try {
      console.log('Attempting to update payment in database with ref:', payment.paymentRef);
      
      // Vérifier si le paiement existe déjà
      const existingPayment = await Payment.findOne({ paymentRef: payment.paymentRef });
      console.log('Existing payment found?', existingPayment ? 'Yes' : 'No');
      
      // Find the payment record by paymentRef and update its status
      const updatedPayment = await Payment.findOneAndUpdate(
        { paymentRef: payment.paymentRef },
        { 
          status: payment.status,
          updatedAt: Date.now(),
          paymentMethod: payment.paymentMethod || 'konnect'
        },
        { new: true }
      );
      
      console.log('Update operation result:', updatedPayment ? 'Success' : 'Failed');

      if (!updatedPayment) {
        console.log('Payment not found in database, creating new record for:', payment.paymentRef);
        
        // If payment record doesn't exist, create a new one
        const newPayment = new Payment({
          paymentRef: payment.paymentRef,
          orderId: payment.orderId || `order-${Date.now()}`,
          userId: '65c3b0f2a86166ef7ccd7c5d', // Using a valid user ID for development
          tourId: 'unknown',
          amount: payment.amount || 0,
          status: payment.status,
          paymentMethod: payment.paymentMethod || 'konnect',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        
        await newPayment.save();
        console.log('Created new payment record from webhook:', payment.paymentRef);
      } else {
        console.log('Payment status updated:', updatedPayment.paymentRef, updatedPayment.status);
      }
    } catch (dbError) {
      console.error('Error updating payment in database:', dbError);
      // Continue processing even if database update fails
    }

    // If payment is successful, increment the reservations count in GuideStats
    if (payment.status === 'completed') {
      console.log('Payment completed successfully for order:', payment.orderId);
      
      try {
        // Get the payment details from the database
        const paymentRecord = await Payment.findOne({ paymentRef: payment.paymentRef });
        
        if (!paymentRecord) {
          console.warn('Payment record not found in database, creating one');
          // Create a new payment record if it doesn't exist
          const newPayment = new Payment({
            paymentRef: payment.paymentRef,
            orderId: payment.orderId || `order-${Date.now()}`,
            status: 'completed',
            amount: payment.amount || 0,
            paymentMethod: payment.paymentMethod || 'konnect',
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
          
          await newPayment.save();
          console.log('Created new payment record from webhook');
        }
        
        // Try multiple approaches to find the tour and guide
        let tourId, tour, guideId;
        
        // Approach 1: Get tour ID from payment record
        if (paymentRecord && paymentRecord.tourId && paymentRecord.tourId !== 'unknown') {
          tourId = paymentRecord.tourId;
          console.log('Found tourId in payment record:', tourId);
        }
        // Approach 2: Try to extract tour ID from orderId
        else if (payment.orderId && payment.orderId.startsWith('tour-')) {
          const parts = payment.orderId.split('-');
          if (parts.length > 1) {
            tourId = parts[1];
            console.log('Extracted tourId from orderId:', tourId);
          }
        }
        
        if (tourId) {
          const Tour = require('../models/Tour');
          tour = await Tour.findById(tourId);
          
          if (tour && tour.guideId) {
            guideId = tour.guideId;
            console.log('Found guideId from tour:', guideId);
            
            // Increment the guide's stats (payments and tourists)
            const GuideStats = require('../models/GuideStats');
            
            let stats = await GuideStats.findOne({ guideId: guideId });
            
            if (!stats) {
              console.log('No stats found for guide, creating new stats document');
              stats = new GuideStats({ guideId: guideId });
            }
            
            // Increment paymentsReceived count
            stats.paymentsReceived += 1;
            
            // Increment touristsCount with participants from payment record (default 1)
            const pNum = (paymentRecord && paymentRecord.participants) ? paymentRecord.participants : 1;
            stats.touristsCount += pNum;
            
            // Also increment revenue if amount is available
            if (payment.amount || (paymentRecord && paymentRecord.amount)) {
              const amountToAdd = (payment.amount || paymentRecord.amount);
              stats.totalRevenue += amountToAdd;
            }
            
            // Save the updated stats
            await stats.save();
            
            // Create a reservation record in the database
            try {
              const Reservation = require('../models/Reservation');
              
              // Check if a reservation already exists for this payment
              const existingReservation = await Reservation.findOne({ paymentRef: payment.paymentRef });
              
              if (!existingReservation) {
                // Get tourist information from payment record
                const userId = paymentRecord?.userId || 'unknown';
                let touristName = 'Client';
                let touristEmail = '';
                let touristPhone = '';
                
                // Try to get tourist details if userId is available
                if (userId && userId !== 'unknown') {
                  try {
                    const User = require('../models/User');
                    const tourist = await User.findById(userId);
                    if (tourist) {
                      touristName = tourist.name || tourist.firstName + ' ' + tourist.lastName || 'Client';
                      touristEmail = tourist.email || '';
                      touristPhone = tourist.phone || '';
                    }
                  } catch (userError) {
                    console.error('Error fetching tourist details:', userError);
                  }
                }
                
                // Create the reservation
                const newReservation = new Reservation({
                  tourId: tourId,
                  tourName: tour.title || tour.name || 'Tour',
                  guideId: guideId,
                  touristId: userId,
                  touristName: touristName,
                  touristEmail: touristEmail,
                  touristPhone: touristPhone,
                  date: new Date(),
                  time: '12:00',
                  participants: paymentRecord?.participants || 1,
                  totalPrice: payment.amount || paymentRecord?.amount || 0,
                  paymentRef: payment.paymentRef,
                  status: 'confirmed',
                  createdAt: new Date(),
                  updatedAt: new Date()
                });
                
                await newReservation.save();
                console.log('Created new reservation record for payment:', payment.paymentRef);
              } else {
                console.log('Reservation already exists for payment:', payment.paymentRef);
              }
            } catch (reservationError) {
              console.error('Error creating reservation:', reservationError);
            }
            
            // Create a notification for the guide
            try {
              const Notification = require('../models/Notification');
              
              // Check if a notification already exists for this payment/reservation
              const existingNotification = await Notification.findOne({
                recipient: guideId,
                tourId: tourId,
                'createdAt': { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Check for notifications in the last 5 minutes
              });
              
              if (!existingNotification) {
                const notification = await Notification.create({
                  recipient: guideId, // Use recipient instead of userId for consistency
                  type: 'reservation',
                  title: 'Nouvelle réservation',
                  description: `Vous avez reçu une nouvelle réservation pour ${tour.title || 'votre tour'}.`,
                  tourId: tourId, // Add tourId for better tracking
                  read: false
                });
                
                console.log('Notification created for guide:', guideId);
              } else {
                console.log('Notification already exists for this reservation, skipping creation');
              }
            } catch (notificationError) {
              console.error('Error creating notification:', notificationError);
            }
          } else {
            console.warn('Could not find guide ID for tour:', tourId);
          }
        } else {
          console.warn('Could not determine tourId from payment:', payment.paymentRef);
        }
      } catch (error) {
        console.error('Error processing payment webhook:', error);
      }
    }

    // Acknowledge receipt of webhook
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ success: false, message: 'Failed to process webhook' });
  }
};