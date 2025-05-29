"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import notificationService, { Notification as NotificationType } from "@/services/notificationService"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import NotificationCard from "./NotificationCard"

export default function NotificationPopover() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Clear cache to ensure we get fresh notifications
      notificationService.clearCache();
      const fetchedNotifications = await notificationService.getUserNotifications();
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Load notifications on component mount and periodically
  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    
    // Set up periodic refresh (every 10 seconds)
    const intervalId = setInterval(fetchNotifications, 10000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Listen for notification events
  useEffect(() => {
    // Create a custom event listener for notification updates
    const handleNotificationUpdate = () => {
      console.log('Notification update event received');
      fetchNotifications();
    };
    
    // Add event listener
    window.addEventListener('notificationUpdate', handleNotificationUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('notificationUpdate', handleNotificationUpdate);
    };
  }, []);
  
  // Refresh notifications when popover is opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Handle notification click
  const handleNotificationClick = async (notification: NotificationType) => {
    try {
      // Mark as read
      await notificationService.markAsRead(notification.id);
      
      // Update the notification's read status in the local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      
      // Handle different notification types
      if (notification.type === "booking" || 
          notification.type === "booking_confirmation" || 
          notification.type === "booking_cancellation") {
        // For all booking-related notifications, navigate to bookings
        window.location.href = "/bookings";
      } else if (notification.type === "review") {
        // For review notifications, navigate to reviews
        window.location.href = "/reviews";
      } else if (notification.type === "payment") {
        // For payment notifications, navigate to payments or bookings
        window.location.href = "/bookings";
      } else if (notification.type === "system") {
        // For system notifications, stay on the current page
        // Just close the popover
      }
      
      // Close the popover
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Call the service to mark all as read
      await notificationService.markAllAsRead();
      
      // Update all notifications to be marked as read
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };



  // Filtrer les notifications pour n'afficher que les types souhaités
  const filteredNotifications = notifications.filter(notification => 
    ['booking', 'booking_confirmation', 'booking_cancellation', 'payment', 'review', 'system'].includes(notification.type)
  );

  // Compter les notifications non lues
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className="relative flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-700"
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-[70vh] overflow-hidden flex flex-col rounded-xl shadow-lg border border-gray-200" align="end">
        <div className="p-2 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center">
            <Bell className="h-4 w-4 text-blue-500 mr-1" />
            <h3 className="font-medium text-sm text-gray-800">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        
        <div className="overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
              <div className="bg-blue-50 rounded-full p-3 mb-2">
                <Bell className="h-8 w-8 text-blue-400 mx-auto" />
              </div>
              <p className="font-medium text-gray-700 mb-1">Aucune notification</p>
              <p className="text-gray-500 text-sm">Vous n'avez pas de notifications pour le moment.</p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </div>
        

      </PopoverContent>
    </Popover>
  );
}
