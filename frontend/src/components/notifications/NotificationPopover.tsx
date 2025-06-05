"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, Clock, FileText, MessageSquare, Star, Tag, AlertCircle, CreditCard, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/app/LogingContext/AuthContext"
import notificationService, { Notification, NotificationType } from "@/services/notificationService"

// Custom scrollbar styles
import "./scrollbar.css"

export default function NotificationPopover({ onMarkAsRead }: { onMarkAsRead?: (count: number) => void }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Fetching notifications for user:', user.id);
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Starting to fetch notifications...');
      // Fetch real notifications from the service
      const fetchedNotifications = await notificationService.getUserNotifications();
      console.log('Fetched notifications:', fetchedNotifications);
      
      setNotifications(fetchedNotifications);
      
      // Calculate and set unread count
      const count = fetchedNotifications.filter(notification => !notification.read).length;
      console.log('Unread count:', count);
      setUnreadCount(count);
      
      // Update the parent component if needed
      if (onMarkAsRead) {
        onMarkAsRead(count);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Impossible de charger les notifications. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Add event listener for notification updates
  useEffect(() => {
    const handleNotificationUpdate = () => {
      console.log('Notification update event received');
      fetchNotifications();
    };

    window.addEventListener('notificationUpdate', handleNotificationUpdate);
    return () => {
      window.removeEventListener('notificationUpdate', handleNotificationUpdate);
    };
  }, []);

  // Add polling for real-time updates
  useEffect(() => {
    if (isAuthenticated && user) {
      const pollInterval = setInterval(() => {
        console.log('Polling for new notifications...');
        fetchNotifications();
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(pollInterval);
    }
  }, [isAuthenticated, user]);

  const markAsRead = async (id: string) => {
    try {
      // Call the service to mark notification as read
      const success = await notificationService.markAsRead(id);
      
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
        
        // Update parent component if needed
        if (onMarkAsRead) {
          const unreadCount = notifications.filter(n => !n.read && n.id !== id).length;
          onMarkAsRead(unreadCount);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Call the service to mark all notifications as read
      const success = await notificationService.markAllAsRead();
      
      if (success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        
        // Update parent component if needed
        if (onMarkAsRead) {
          onMarkAsRead(0);
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Filter notifications to show most recent first
  const filteredNotifications = [...notifications]
    .sort((a, b) => {
      // Parse the time strings to get Date objects for comparison
      const dateA = new Date(a.time);
      const dateB = new Date(b.time);
      return dateB.getTime() - dateA.getTime();
    });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'booking':
      case 'booking_confirmation':
        return <Calendar className="h-5 w-5 text-indigo-600" />;
      case 'booking_cancellation':
        return <AlertCircle className="h-5 w-5 text-rose-600" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-emerald-600" />;
      case 'review':
        return <Star className="h-5 w-5 text-amber-500" />;
      case 'system':
        return <CheckCircle className="h-5 w-5 text-sky-600" />;
      default:
        return <Bell className="h-5 w-5 text-slate-600" />;
    }
  };

  // Use the time string directly since it's already formatted in the service

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-80 overflow-hidden rounded-xl shadow-xl"
    >
      <div className="flex flex-col max-h-[450px] bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-amber-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 text-gray-700 hover:bg-gray-200 transition-colors self-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-green-600">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            {notifications.length > 0 && (
              <button
                className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                onClick={markAllAsRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[300px] custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400 shadow-md"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="p-3 bg-red-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Aucune notification</p>
            </div>
          ) : (
            <div className="py-1">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer group border-l-2 ${!notification.read ? "border-l-amber-500 bg-amber-50/30" : "border-l-transparent"}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-100 shadow-sm">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-xs truncate ${!notification.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">{notification.time}</span>
                          {!notification.read && (
                            <div className="bg-amber-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                              1
                            </div>
                          )}
                        </div>
                      </div>
                      <p className={`text-xs line-clamp-2 ${!notification.read ? "text-gray-800" : "text-gray-600"}`}>
                        {notification.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
