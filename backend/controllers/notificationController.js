const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all notifications for the current user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all notifications for this user, sorted by creation date (newest first)
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to prevent overwhelming response

    // Format the notifications for the frontend
    const formattedNotifications = notifications.map(notification => {
      // Format the time as "Il y a X minutes/heures/jours" for frontend
      const timeAgo = formatTimeAgo(notification.createdAt);
      
      return {
        id: notification._id,
        title: notification.title,
        description: notification.description,
        time: timeAgo,
        type: notification.type,
        read: notification.read,
        avatar: notification.avatar,
        tourId: notification.tourId,
        guideId: notification.guideId,
        userId: notification.userId,
        amount: notification.amount
      };
    });
    
    res.status(200).json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications', error: error.message });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { touristNotification, guideNotification } = req.body;
    
    // Logs supprimés pour éviter de polluer la console
    
    // Create notifications array to store all notifications to be created
    const notifications = [];
    
    // Add tourist notification if provided
    // Add tourist notification if provided and it has a recipient
    if (touristNotification && touristNotification.recipient) {
      // Create the notification object with common fields
      const notificationObj = {
        recipient: touristNotification.recipient,
        title: touristNotification.title,
        description: touristNotification.description,
        type: touristNotification.type || 'system',
        tourId: touristNotification.tourId,
        avatar: touristNotification.avatar
      };
      
      // Add specific fields based on notification type
      if (touristNotification.type === 'payment') {
        notificationObj.amount = touristNotification.amount;
      } else if (touristNotification.type === 'booking_confirmation' || 
                touristNotification.type === 'booking_cancellation') {
        // Additional booking-specific data could be added here if needed
        notificationObj.priority = touristNotification.type === 'booking_cancellation' ? 'high' : 'normal';
      }
      
      notifications.push(notificationObj);
    }
    
    // Add guide notification if provided and it has a recipient
    if (guideNotification && guideNotification.recipient) {
      // Create the notification object with common fields
      const notificationObj = {
        recipient: guideNotification.recipient,
        title: guideNotification.title,
        description: guideNotification.description,
        type: guideNotification.type || 'system',
        tourId: guideNotification.tourId,
        avatar: guideNotification.avatar
      };
      
      // Add specific fields based on notification type
      if (guideNotification.type === 'payment') {
        notificationObj.amount = guideNotification.amount;
      } else if (guideNotification.type === 'booking_confirmation' || 
                guideNotification.type === 'booking_cancellation') {
        // For booking notifications, we might want to track additional data
        notificationObj.priority = guideNotification.type === 'booking_cancellation' ? 'high' : 'normal';
        notificationObj.userId = touristNotification?.userId; // Track the tourist's ID for the guide
      }
      
      notifications.push(notificationObj);
    }
    
    // Create all notifications in the database
    if (notifications.length > 0) {
      const result = await Notification.insertMany(notifications);
      res.status(201).json({ 
        message: 'Notifications créées avec succès',
        count: result.length,
        notifications: result.map(n => n._id)
      });
    } else {
      res.status(400).json({ message: 'Aucune notification valide fournie' });
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création des notifications', 
      error: error.message 
    });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Logs supprimés pour éviter de polluer la console
    
    // Find the notification and ensure it belongs to the current user
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    // Update the notification
    notification.read = true;
    await notification.save();
    res.status(200).json({ 
      message: 'Notification marquée comme lue',
      notificationId
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de la notification',
      error: error.message 
    });
  }
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );
    
    res.status(200).json({ 
      message: 'Toutes les notifications ont été marquées comme lues',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour des notifications',
      error: error.message 
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Find and delete the notification
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    res.status(200).json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la notification' });
  }
};

// Helper function to format time ago in French
function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Il y a quelques secondes';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
  
  // Format date for older notifications
  return date.toLocaleDateString('fr-FR');
}

// Create a system notification for all users or specific user types
exports.createSystemNotification = async (req, res) => {
  try {
    const { title, description, userType } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Le titre et la description sont requis' });
    }
    
    // Find users based on userType filter (if provided)
    let userQuery = {};
    if (userType && ['tourist', 'guide'].includes(userType)) {
      userQuery.userType = userType;
    }
    
    const users = await User.find(userQuery).select('_id');
    
    // Create a notification for each user
    const notifications = users.map(user => ({
      recipient: user._id,
      title,
      description,
      type: 'system'
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      res.status(201).json({ 
        message: 'Notifications système créées avec succès',
        count: notifications.length
      });
    } else {
      res.status(400).json({ message: 'Aucun utilisateur trouvé pour envoyer des notifications' });
    }
  } catch (error) {
    console.error('Error creating system notifications:', error);
    res.status(500).json({ message: 'Erreur lors de la création des notifications système' });
  }
};
