import axios from 'axios';

// Define the API URL from environment variables or use a default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Add request timeout to prevent hanging requests
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
});

// Define notification types
export type NotificationType = 'booking' | 'payment' | 'review' | 'system' | 'booking_confirmation' | 'booking_cancellation';

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

// Track when the cache was last updated
let lastCacheTime = 0;

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
  // Clear the notification cache manually
  clearCache: () => {
    console.log('Manually clearing notification cache');
    cachedNotifications = null;
    lastCacheTime = 0;
  },
  
  // Get all notifications for the current user
  getUserNotifications: async (): Promise<Notification[]> => {
    try {
      // Return cached notifications if available and not expired
      // We'll use a 5-second cache to ensure new notifications appear quickly
      if (cachedNotifications && Date.now() - lastCacheTime < 5000) {
        console.log('Returning cached notifications');
        return cachedNotifications;
      }
      
      // Always clear cache when explicitly fetching notifications
      cachedNotifications = null;

      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found, returning fallback notifications');
        return fallbackNotifications;
      }

      console.log('Fetching notifications from API...');
      const response = await axiosInstance.get<Notification[]>('/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(`Received ${response.data.length} notifications from API`);
      
      // Update cache with fresh data
      cachedNotifications = response.data;
      lastCacheTime = Date.now();
      
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
      } else if (axiosError.request) {
        console.log('No response received from server - network issue');
      } else {
        console.log('Error during request setup:', axiosError.message);
      }
      
      // If we have cached notifications, return those instead of fallbacks
      if (cachedNotifications) {
        console.log('Returning last cached notifications due to error');
        return cachedNotifications;
      }
      
      console.log('Returning fallback notifications');
      return fallbackNotifications;
    }
  },

  // Create a new booking notification
  createBookingNotification: async (
    tourId: string,
    tourTitle: string,
    tourDate: string,
    guideId: string,
    userId: string,
    touristName: string
  ): Promise<boolean> => {
    try {
      console.log('Creating booking notification with:', { tourId, tourTitle, tourDate, guideId, userId, touristName });
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, cannot create booking notification');
        return false;
      }
      
      // Format the date for display
      const formattedDate = new Date(tourDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      // Create notification for the tourist
      const touristNotification = {
        title: "Réservation confirmée",
        description: `Votre réservation pour ${tourTitle} le ${formattedDate} a été confirmée.`,
        type: "booking_confirmation",
        tourId,
        recipient: userId, // This is the key field expected by the backend
        read: false
      };

      // Create notification for the guide
      const guideNotification = {
        title: "Nouvelle réservation",
        description: `${touristName} a réservé votre visite ${tourTitle} pour le ${formattedDate}.`,
        type: "booking_confirmation",
        tourId,
        recipient: guideId, // This is the key field expected by the backend
        userId: userId, // Track the tourist's ID for the guide (for reference)
        read: false
      };
      
      console.log('Booking notification payloads:', { touristNotification, guideNotification });

      // Send both notifications in a single request
      console.log('Sending to API URL:', `${API_URL}/notifications`);
      const response = await axios.post(`${API_URL}/notifications`, 
        { 
          touristNotification,
          guideNotification
        }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Booking notification API response:', response.status, response.data);

      // Clear the cache to force a refresh
      cachedNotifications = null;
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('notificationUpdate'));
      
      return true;
    } catch (error) {
      console.log('Error creating booking notification:', error);
      
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
      console.log('API call failed, creating local booking notifications as fallback');
      
      // Format the date for display
      const formattedDate = new Date(tourDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      // Create tourist notification locally
      addLocalNotification({
        title: "Réservation confirmée",
        description: `Votre réservation pour ${tourTitle} le ${formattedDate} a été confirmée.`,
        type: "booking_confirmation",
        tourId,
        userId
      });
      
      // Create guide notification locally
      addLocalNotification({
        title: "Nouvelle réservation",
        description: `${touristName} a réservé votre visite ${tourTitle} pour le ${formattedDate}.`,
        type: "booking_confirmation",
        tourId,
        guideId
      });
      
      return true; // Return true since we created local notifications
    }
  },
  
  // Create a new cancellation notification
  createCancellationNotification: async (
    tourId: string,
    tourTitle: string,
    guideId: string,
    userId: string,
    touristName: string,
    reason?: string
  ): Promise<boolean> => {
    try {
      console.log('Creating cancellation notification with:', { tourId, tourTitle, guideId, userId, touristName, reason });
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, cannot create cancellation notification');
        return false;
      }
      
      // Create notification for the tourist
      const touristNotification = {
        title: "Réservation annulée",
        description: reason 
          ? `Votre réservation pour ${tourTitle} a été annulée. Raison: ${reason}`
          : `Votre réservation pour ${tourTitle} a été annulée.`,
        type: "booking_cancellation",
        tourId,
        userId
      };

      // Create notification for the guide
      const guideNotification = {
        title: "Réservation annulée",
        description: reason 
          ? `${touristName} a annulé sa réservation pour ${tourTitle}. Raison: ${reason}`
          : `${touristName} a annulé sa réservation pour ${tourTitle}.`,
        type: "booking_cancellation",
        tourId,
        guideId
      };
      
      console.log('Cancellation notification payloads:', { touristNotification, guideNotification });

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
      
      console.log('Cancellation notification API response:', response.status, response.data);

      // Clear the cache to force a refresh
      cachedNotifications = null;
      
      return true;
    } catch (error) {
      console.log('Error creating cancellation notification:', error);
      
      // Create local notifications as fallback
      console.log('API call failed, creating local cancellation notifications as fallback');
      
      // Create tourist notification locally
      addLocalNotification({
        title: "Réservation annulée",
        description: reason 
          ? `Votre réservation pour ${tourTitle} a été annulée. Raison: ${reason}`
          : `Votre réservation pour ${tourTitle} a été annulée.`,
        type: "booking_cancellation",
        tourId,
        userId
      });
      
      // Create guide notification locally
      addLocalNotification({
        title: "Réservation annulée",
        description: reason 
          ? `${touristName} a annulé sa réservation pour ${tourTitle}. Raison: ${reason}`
          : `${touristName} a annulé sa réservation pour ${tourTitle}.`,
        type: "booking_cancellation",
        tourId,
        guideId
      });
      
      return true; // Return true since we created local notifications
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

      // Check if the guide is reserving their own tour
      const isSelfReservation = userId === guideId;
      console.log('Is self reservation?', isSelfReservation, { userId, guideId });
      
      // Create notifications
      const touristNotification = {
        title: "Paiement confirmé",
        description: `Votre paiement de ${amount} TND pour ${tourTitle} a été confirmé.`,
        type: "payment",
        tourId,
        recipient: userId,
        read: false,
        amount
      };
      
      // Only create guide notification if it's not a self-reservation
      const notificationPayload = isSelfReservation 
        ? { touristNotification } 
        : { 
            touristNotification,
            guideNotification: {
              title: "Nouvelle réservation",
              description: `Une nouvelle réservation a été confirmée pour votre tour avec un paiement de ${amount} TND.`,
              type: "booking",
              tourId,
              recipient: guideId,
              read: false,
              amount
            }
          };
      
      console.log('Payment notifications payload:', notificationPayload);
      
      // Send notifications in a single request
      console.log('Creating payment notifications at:', `${API_URL}/notifications`);
      const response = await axios.post(
        `${API_URL}/notifications`, 
        notificationPayload, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Payment notifications created successfully:', response.status, response.data);
      
      // Clear the cache to force a refresh
      cachedNotifications = null;
      console.log('Notification cache cleared after creation');
      
      // Dispatch a custom event to trigger notification refresh
      window.dispatchEvent(new Event('notificationUpdate'));
      
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
      
      // Check if the guide is reserving their own tour
      const isSelfReservation = userId === guideId;
      
      // Create tourist notification locally
      addLocalNotification({
        title: "Paiement confirmé",
        description: `Votre paiement de ${amount} TND pour ${tourTitle} a été confirmé.`,
        type: "payment",
        tourId,
        userId
      });
      
      // Create guide notification locally only if not self-reservation
      if (!isSelfReservation) {
        addLocalNotification({
          title: "Nouvelle réservation",
          description: `Une nouvelle réservation a été confirmée pour votre tour avec un paiement de ${amount} TND.`,
          type: "booking",
          tourId,
          guideId,
          amount
        });
      }
      
      return true; // Return true since we created local notifications
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      console.log(`Marking notification ${notificationId} as read`);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No auth token found, cannot mark notification as read');
        return false;
      }

      const response = await axiosInstance.patch(`/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Successfully marked notification as read:', response.data);

      // Update the cache if we have it
      if (cachedNotifications) {
        cachedNotifications = cachedNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        );
      }

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      const axiosError = error as any;
      if (axiosError.response) {
        console.error('Server error details:', {
          status: axiosError.response.status,
          data: axiosError.response.data
        });
      }
      return false;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, cannot mark notifications as read');
        return false;
      }
      
      const response = await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Mark all as read response:', response.status, response.data);
      
      // Clear the cache to force a refresh
      cachedNotifications = null;
      
      return true;
    } catch (error) {
      console.log('Error marking all notifications as read:', error);
      return false;
    }
  }
};

export default notificationService;
