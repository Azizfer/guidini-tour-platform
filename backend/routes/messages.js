// Backend: routes/messages.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// Get all conversations for a user
router.get('/conversations', auth, messageController.getConversations);

// Get messages for a specific conversation
router.get('/conversation/:conversationId', auth, messageController.getConversationMessages);

// Send a new message
router.post('/send', auth, messageController.sendMessage);

// Mark messages as read
router.put('/read/:conversationId', auth, messageController.markAsRead);

module.exports = router;