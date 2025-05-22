const express = require('express');
const router = express.Router(); //creation of router object
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth'); // Middleware d'authentification checks the user loggin-in

// Route pour initialiser un paiement
router.post('/initialize', paymentController.initializePayment); //requires auth + identifies the called function 

// Route pour vérifier le statut d'un paiement
router.get('/status/:paymentRef', auth, paymentController.getPaymentStatus);

//  Les webhooks ne doivent pas être protégés par auth car ils sont appelés par Konnect
// Support both POST and GET for webhook endpoint
router.post('/webhook', paymentController.handleWebhook);
router.get('/webhook', paymentController.handleWebhook);

module.exports = router;
