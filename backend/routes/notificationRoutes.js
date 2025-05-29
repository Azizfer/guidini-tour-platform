const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all notifications for the current user
router.get('/', notificationController.getUserNotifications);

// Create a new notification (for payment, booking, etc.)
router.post('/', notificationController.createNotification);

// Mark a notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Delete a notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Create system notifications (admin only)
// TODO: Add admin middleware check
router.post('/system', notificationController.createSystemNotification);

module.exports = router;
