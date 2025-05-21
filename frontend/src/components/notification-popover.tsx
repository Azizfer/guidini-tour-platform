"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, Check, X, Calendar, Star, MessageSquare, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: "booking" | "review" | "system" | "message"
  read: boolean
  avatar?: string
}

const dummyNotifications: Notification[] = [
  {
    id: "1",
    title: "Réservation confirmée",
    description: "Votre réservation pour l'excursion à Carthage a été confirmée.",
    time: "Il y a 10 minutes",
    type: "booking",
    read: false,
    avatar: "/placeholder.svg?height=40&width=40&text=C",
  },
  {
    id: "2",
    title: "Nouvel avis",
    description: "Ahmed a laissé un avis 5 étoiles sur votre profil.",
    time: "Il y a 2 heures",
    type: "review",
    read: false,
    avatar: "/placeholder.svg?height=40&width=40&text=A",
  },
  {
    id: "3",
    title: "Rappel d'activité",
    description: "Votre excursion à Sidi Bou Said commence demain à 9h00.",
    time: "Il y a 5 heures",
    type: "system",
    read: true,
  },
  {
    id: "4",
    title: "Nouveau message",
    description: "Vous avez reçu un nouveau message de Sarah.",
    time: "Hier",
    type: "message",
    read: true,
    avatar: "/placeholder.svg?height=40&width=40&text=S",
  },
]

export default function NotificationPopover() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);
  
  // Function to prevent event propagation
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };
  
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
  }, []);
  
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

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4" />
      case "review":
        return <Star className="h-4 w-4" />
      case "message":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div 
      className="w-[350px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 absolute right-0"
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
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-center gap-2">
                    {notification.avatar ? (
                      <div className="relative h-8 w-8 shrink-0">
                        <img
                          src={notification.avatar || "/placeholder.svg"}
                          alt=""
                          className="rounded-full object-cover h-8 w-8"
                        />
                        <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 shrink-0">
                        {getIcon(notification.type)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                      </div>
                      <p className="text-[12px] text-gray-600 mt-0.5 line-clamp-2">{notification.description}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{notification.time}</p>
                    </div>

                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className={cn(
                          "rounded-lg flex items-center justify-center h-8 w-8 p-0",
                          "text-gray-400 hover:text-red-600",
                          "transition-colors",
                        )}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {!notification.read && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-500" />}
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
        

      </div>
    </div>
  )
}
