const axios = require('axios');
const mongoose = require('mongoose');

// Import Payment model
const Payment = require('../models/payment');

// Konnect API configuration
// Load environment variables if not already loaded
require('dotenv').config();

// Utiliser l'URL de base de l'API Konnect (environnement sandbox)
const KONNECT_API_URL = process.env.KONNECT_API_URL || 'https://api.sandbox.konnect.network';

// La clé API Konnect au format 'ID:SECRET' doit être utilisée telle quelle dans l'en-tête 'x-api-key'
// Si la clé n'est pas définie dans les variables d'environnement, utiliser une clé de test
const KONNECT_API_KEY = process.env.KONNECT_API_KEY || 'test_ID:test_SECRET';

// ID du portefeuille du destinataire (à définir dans les variables d'environnement)
const RECEIVER_WALLET_ID = process.env.KONNECT_RECEIVER_WALLET_ID || 'test_wallet_id';

// URL de base du backend pour les webhooks et redirections
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// URL de redirection après paiement (frontend)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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
    console.log('Complete API URL:', `${KONNECT_API_URL}/payments/init-payment`);
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
        
        // If we get here, the request was successful
        console.log('Payment initialization successful. Response:', {
          payUrl: response.data.payUrl,
          paymentRef: response.data.paymentRef,
          orderId: response.data.orderId
        });
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
      
      // Extraire l'ID du tour proprement
      let cleanTourId = tourId || 'unknown';
      // Si tourId est fourni dans les données de paiement, l'utiliser directement
      if (paymentData.tourId) {
        cleanTourId = paymentData.tourId;
      }
      
      // Create a new payment record
      const payment = new Payment({
        paymentRef: response.data.paymentRef,
        orderId: cleanOrderId,
        userId: req.user ? req.user._id : (paymentData.userId || 'anonymous'),
        tourId: cleanTourId,
        amount: amount,
        status: 'pending',
        customerName: `${firstName || ''} ${lastName || ''}`.trim(),
        customerEmail: email || '',
        customerPhone: phoneNumber || '',
        participants: paymentData.participants || 1,
        reservationDate: paymentData.date ? new Date(paymentData.date) : new Date(),
        paymentMethod: 'konnect'
      });
      
      console.log('Payment object created:', JSON.stringify(payment, null, 2));

      // Save the payment to the database
      const savedPayment = await payment.save();
      console.log('Payment record created successfully:', savedPayment.paymentRef);
      console.log('Payment ID in database:', savedPayment._id);
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
      success: true,
      payUrl: response.data.payUrl,
      paymentRef: response.data.paymentRef,
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
      
      // Check if this is a user being redirected after payment
      const paymentRef = req.query.payment_ref;
      
      if (paymentRef) {
        // This is a user being redirected after payment, redirect them to the frontend
        console.log('User redirected to webhook with payment_ref, redirecting to frontend');
        return res.redirect(`${FRONTEND_URL}/payment/callback?payment_ref=${paymentRef}`);
      }
      
      // This is just a verification of the webhook endpoint
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
          userId: 'webhook-created',
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

    // If payment is successful, update tour booking status
    if (payment.status === 'completed') {
      console.log('Payment completed successfully for order:', payment.orderId);
      // Here you could add code to create a reservation or update tour booking status
      // For example:
      // await createReservation(payment.paymentRef);
    }

    // Acknowledge receipt of webhook
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ success: false, message: 'Failed to process webhook' });
  }
};
