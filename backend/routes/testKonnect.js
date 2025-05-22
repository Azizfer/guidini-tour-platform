const express = require('express');
const router = express.Router();
const axios = require('axios');

// Route de test pour Konnect
router.get('/test-konnect', async (req, res) => {
  try {
    const KONNECT_API_KEY = process.env.KONNECT_API_KEY;
    // Utiliser l'URL de l'environnement sandbox
    const KONNECT_API_URL = process.env.KONNECT_API_URL || 'https://api.sandbox.konnect.network';
    
    console.log('Testing Konnect API connection...');
    console.log('API URL:', KONNECT_API_URL);
    console.log('API Key (first 10 chars):', KONNECT_API_KEY ? KONNECT_API_KEY.substring(0, 10) + '...' : 'undefined');
    
    // Essayer une requête d'initialisation de paiement de test
    const testPaymentData = {
      receiverWalletId: process.env.KONNECT_RECEIVER_WALLET_ID,
      token: "TND",
      amount: 1000, // 1 TND en millimes
      type: "immediate",
      description: "Test de connexion API Konnect",
      acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
      lifespan: 1, // 1 minute seulement pour le test
      checkoutForm: true,
      addPaymentFeesToAmount: true,
      firstName: "Test",
      lastName: "User",
      phoneNumber: "22000000",
      email: "test@example.com",
      orderId: `test-${Date.now()}`,
      webhook: `${process.env.BACKEND_URL}/api/payments/webhook`,
      theme: "light"
    };
    
    console.log('Test payment data:', testPaymentData);
    
    const response = await axios.post(`${KONNECT_API_URL}/api/v2/payments/init-payment`, testPaymentData, {
      headers: {
        // Utiliser la clé API complète comme indiqué dans la documentation
        'x-api-key': KONNECT_API_KEY.trim(),
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Konnect API test successful!');
    res.json({
      success: true,
      message: 'Konnect API connection successful',
      data: response.data
    });
  } catch (error) {
    console.error('Error testing Konnect API:');
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received - network issue');
    } else {
      console.error('Error message:', error.message);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to connect to Konnect API',
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;
