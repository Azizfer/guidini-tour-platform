"use client"

import { useState, useEffect } from "react"
import { Bell, RefreshCw } from "lucide-react"
import notificationService, { Notification } from "@/services/notificationService"
import NotificationCard from "./NotificationCard"

export default function NotificationDashboard() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");

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

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications based on active filter
  const getFilteredNotifications = () => {
    if (activeFilter === "all") {
      return notifications;
    }
    return notifications.filter(notification => notification.type === activeFilter);
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
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
        // For booking notifications, navigate to bookings
        window.location.href = "/bookings";
      } else if (notification.type === "review") {
        // For review notifications, navigate to reviews
        window.location.href = "/reviews";
      } else if (notification.type === "payment") {
        // For payment notifications, navigate to payments or bookings
        window.location.href = "/bookings";
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Get count of notifications by type
  const getCountByType = (type: string) => {
    return notifications.filter(n => n.type === type).length;
  };

  // Get filter button class
  const getFilterButtonClass = (filter: string) => {
    return `px-4 py-2 text-sm rounded-md transition-colors ${
      activeFilter === filter 
        ? "bg-blue-100 text-blue-700 font-medium" 
        : "hover:bg-gray-100"
    }`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold text-xl flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </h2>
        <button 
          onClick={fetchNotifications}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Actualiser"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="p-2 border-b border-gray-200 flex gap-1 overflow-x-auto">
        <button 
          className={getFilterButtonClass("all")}
          onClick={() => setActiveFilter("all")}
        >
          Tous ({notifications.length})
        </button>
        <button 
          className={getFilterButtonClass("booking_confirmation")}
          onClick={() => setActiveFilter("booking_confirmation")}
        >
          Réservations ({getCountByType("booking_confirmation")})
        </button>
        <button 
          className={getFilterButtonClass("booking_cancellation")}
          onClick={() => setActiveFilter("booking_cancellation")}
        >
          Annulations ({getCountByType("booking_cancellation")})
        </button>
        <button 
          className={getFilterButtonClass("payment")}
          onClick={() => setActiveFilter("payment")}
        >
          Paiements ({getCountByType("payment")})
        </button>
        <button 
          className={getFilterButtonClass("review")}
          onClick={() => setActiveFilter("review")}
        >
          Avis ({getCountByType("review")})
        </button>
        <button 
          className={getFilterButtonClass("system")}
          onClick={() => setActiveFilter("system")}
        >
          Système ({getCountByType("system")})
        </button>
      </div>

      {/* Notifications list */}
      <div className="max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : getFilteredNotifications().length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="text-gray-400 mb-4">
              <Bell className="h-16 w-16 mx-auto" />
            </div>
            <p className="text-gray-500">
              {activeFilter === "all" 
                ? "Vous n'avez pas de notifications." 
                : `Vous n'avez pas de notifications de type "${activeFilter}".`}
            </p>
          </div>
        ) : (
          <div>
            {getFilteredNotifications().map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
