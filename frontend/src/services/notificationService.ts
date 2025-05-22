import axios from 'axios';

// Define the API URL from environment variables or use a default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Define notification types
export type NotificationType = 'booking' | 'payment' | 'review' | 'system';

// Define notification interface
export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  read: boolean;
  avatar?: string;
  tourId?: string;
  guideId?: string;
  userId?: string;
  amount?: number;
}

// Cache for notifications to avoid multiple requests
let cachedNotifications: Notification[] | null = null;

// Fallback notifications for when the API is unavailable
const fallbackNotifications: Notification[] = [
  {
    id: "1",
    title: "Réservation confirmée",
    description: "Votre réservation pour Visite guidée des ruines de Carthage a été confirmée.",
    time: "Il y a 2 heures",
    type: "booking",
    read: false
  },
  {
    id: "2",
    title: "Nouvelle évaluation",
    description: "Vous avez reçu une nouvelle évaluation 5 étoiles pour votre visite guidée.",
    time: "Il y a 1 jour",
    type: "review",
    read: true
  }
];

// Function to add a notification locally when API fails
const addLocalNotification = (notification: Omit<Notification, 'id' | 'time' | 'read'>) => {
  const newNotification: Notification = {
    ...notification,
    id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    time: 'À l\'instant',
    read: false
  };
  
  if (cachedNotifications) {
    cachedNotifications = [newNotification, ...cachedNotifications];
  } else {
    cachedNotifications = [newNotification];
  }
  
  console.log('Added local notification:', newNotification);
  return newNotification;
};

// Function to format time ago
export const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Il y a quelques secondes';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;
  
  return date.toLocaleDateString('fr-FR');
};

const notificationService = {
  // Get all notifications for the current user
  getUserNotifications: async (): Promise<Notification[]> => {
    try {
      // Clear cache if needed
      if (cachedNotifications) {
        return cachedNotifications;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        return fallbackNotifications;
      }

      const response = await axios.get<Notification[]>(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      cachedNotifications = response.data;
      return response.data;
    } catch (error) {
      console.log('Error fetching notifications:', error);
      // Log more details if available
      const axiosError = error as any;
      if (axiosError.response) {
        console.log('Server responded with error:', {
          status: axiosError.response.status,
          data: axiosError.response.data
        });
      }
      return fallbackNotifications;
    }
  },

  // Create a new payment notification
  createPaymentNotification: async (
    tourId: string,
    tourTitle: string,
    amount: number,
    guideId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      console.log('Creating payment notification with:', { tourId, tourTitle, amount, guideId, userId });
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, cannot create notification');
        return false;
      }
      
      console.log('Token found:', token.substring(0, 10) + '...');

      // Create notification for the tourist
      const touristNotification = {
        title: "Paiement réussi",
        description: `Votre paiement de ${amount} TND pour ${tourTitle} a été confirmé.`,
        type: "payment",
        tourId,
        userId
      };

      // Create notification for the guide
      const guideNotification = {
        title: "Nouveau paiement reçu",
        description: `Vous avez reçu un paiement de ${amount} TND pour ${tourTitle}.`,
        type: "payment",
        tourId,
        guideId,
        amount
      };
      
      console.log('Notification payloads:', { touristNotification, guideNotification });
      console.log('Sending to API URL:', `${API_URL}/notifications`);

      // Send notifications to the backend
      const response = await axios.post(`${API_URL}/notifications`, 
        { 
          touristNotification,
          guideNotification
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Notification API response:', response.status, response.data);

      // Clear the cache to force a refresh
      cachedNotifications = null;
      console.log('Notification cache cleared after creation');
      
      return true;
    } catch (error) {
      console.log('Error creating payment notification:', error);
      
      // More detailed error logging
      const axiosError = error as any;
      if (axiosError.response) {
        console.log('Error response from server:', {
          status: axiosError.response.status,
          data: axiosError.response.data
        });
      } else if (axiosError.request) {
        console.log('No response received from server');
      } else if (error instanceof Error) {
        console.log('Error message:', error.message);
      } else {
        console.log('Unknown error type');
      }
      
      // Create local notifications as fallback
      console.log('API call failed, creating local notifications as fallback');
      
      // Create tourist notification locally
      addLocalNotification({
        title: "Paiement réussi",
        description: `Votre paiement de ${amount} TND pour ${tourTitle} a été confirmé.`,
        type: "payment",
        tourId,
        userId
      });
      
      // Create guide notification locally
      addLocalNotification({
        title: "Nouveau paiement reçu",
        description: `Vous avez reçu un paiement de ${amount} TND pour ${tourTitle}.`,
        type: "payment",
        tourId,
        guideId,
        amount
      });
      
      return true; // Return true since we created local notifications
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the cache
      if (cachedNotifications) {
        cachedNotifications = cachedNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        );
      }

      return true;
    } catch (error) {
      console.log('Error marking notification as read:', error);
      return false;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return false;
      }

      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the cache
      if (cachedNotifications) {
        cachedNotifications = cachedNotifications.map(notification => ({ 
          ...notification, 
          read: true 
        }));
      }

      return true;
    } catch (error) {
      console.log('Error marking all notifications as read:', error);
      return false;
    }
  },

  // Clear the cache
  clearCache: () => {
    cachedNotifications = null;
  }
};

export default notificationService;
