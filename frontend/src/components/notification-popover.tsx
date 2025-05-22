"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Check, X, Calendar, Star, ChevronUp, ChevronDown, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import notificationService, { Notification as NotificationType } from "@/services/notificationService"

export default function NotificationPopover() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Function to prevent event propagation
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };
  
  // Fetch notifications periodically regardless of popover state
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
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

    // Initial fetch
    setLoading(true);
    fetchNotifications();
    
    // Set up periodic refresh (every 15 seconds) regardless of popover state
    // This ensures the notification bell indicator is always up to date
    const intervalId = setInterval(fetchNotifications, 15000);
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Refresh notifications when popover is opened
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      notificationService.clearCache();
      notificationService.getUserNotifications()
        .then(fetchedNotifications => {
          setNotifications(fetchedNotifications);
        })
        .catch(error => {
          console.error('Error fetching notifications:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);
  
  // Check if content is scrollable and update scroll state
  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = contentRef.current;
        setShowScrollButtons(scrollHeight > clientHeight);
        setMaxScroll(scrollHeight - clientHeight);
        setScrollPosition(scrollTop);
      }
    };
    
    checkScrollable();
    
    // Add resize observer to check when content changes
    const resizeObserver = new ResizeObserver(checkScrollable);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    return () => {
      if (contentRef.current) {
        resizeObserver.unobserve(contentRef.current);
      }
    };
  }, [notifications]);
  
  // Handle scroll events
  const handleScroll = () => {
    if (contentRef.current) {
      setScrollPosition(contentRef.current.scrollTop);
    }
  };
  
  // Scroll up function
  const scrollUp = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ top: -100, behavior: 'smooth' });
    }
  };
  
  // Scroll down function
  const scrollDown = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ top: 100, behavior: 'smooth' });
    }
  };

  // Handle notification click based on type
  const handleNotificationClick = (notification: NotificationType) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Handle different notification types
    if (notification.type === "booking") {
      // For booking notifications, navigate to bookings
      window.location.href = "/bookings";
    } else if (notification.type === "review") {
      // For review notifications, navigate to reviews
      window.location.href = "/reviews";
    } else if (notification.type === "payment") {
      // For payment notifications, navigate to payments or bookings
      window.location.href = "/bookings";
    }
    // Close the popover
    setIsOpen(false);
  };
  
  const markAsRead = async (id: string) => {
    try {
      // Call the service to mark as read
      await notificationService.markAsRead(id);
      
      // Update the notification's read status in the local state
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  const markAllAsRead = async () => {
    try {
      // Call the service to mark all as read
      await notificationService.markAllAsRead();
      
      // Update all notifications to be marked as read
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  const deleteNotification = (id: string) => {
    // Only hide the notification in the UI, don't delete from database
    setNotifications(notifications.filter((n) => n.id !== id));
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "review":
        return <Star className="h-5 w-5 text-yellow-500" />
      case "payment":
        return <CreditCard className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div 
      className="w-[350px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 absolute right-0 z-[100]"
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onMouseUp={stopPropagation}
      onTouchStart={stopPropagation}
      onTouchEnd={stopPropagation}
      onTouchMove={stopPropagation}
    >
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <Bell className="h-4 w-4 text-gray-500" />
          Notifications
          {unreadCount > 0 && (
            <span className="bg-gray-100 text-gray-800 text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
          )}
        </h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs text-gray-600 hover:text-gray-900 h-7 px-2"
          >
            <Check className="h-3 w-3 mr-1" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <div className="relative">
        <div 
          ref={contentRef}
          className="max-h-[350px] overflow-y-auto" 
          id="notification-scroll-area"
          onScroll={handleScroll}
        >
          {notifications.length > 0 ? (
            <div className="p-2">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "relative bg-white border rounded-lg p-2 mb-2",
                    notification.read ? "border-gray-100" : "border-gray-200 bg-gray-50",
                  )}
                >
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-3 border-b border-gray-100 last:border-0 cursor-pointer transition-colors",
                      notification.read ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar or icon */}
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <img
                            src={notification.avatar}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                      </div>

                      {/* Mark as read button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className={cn(
                          "flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                          notification.read
                            ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            : "text-blue-500 hover:bg-blue-100"
                        )}
                        aria-label="Marquer comme lu"
                      >
                        {notification.read ? null : <Check className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="flex justify-center mb-2">
                <Bell className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-sm">Aucune notification</p>
            </div>
          )}
        </div>
        
        {/* Scroll buttons */}
        {showScrollButtons && (
          <div className="absolute right-2 flex flex-col gap-1">
            <button
              onClick={scrollUp}
              className={`p-1 rounded-full bg-white shadow-md ${scrollPosition <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              disabled={scrollPosition <= 0}
            >
              <ChevronUp className="h-3 w-3 text-gray-600" />
            </button>
            <button
              onClick={scrollDown}
              className={`p-1 rounded-full bg-white shadow-md ${scrollPosition >= maxScroll ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              disabled={scrollPosition >= maxScroll}
            >
              <ChevronDown className="h-3 w-3 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
