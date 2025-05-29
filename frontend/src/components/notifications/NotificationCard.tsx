"use client"

import { CheckCircle, XCircle, CreditCard, Star, Bell, AlertCircle, Clock } from "lucide-react"
import { Notification } from "@/services/notificationService"
import { cn } from "@/lib/utils"

interface NotificationCardProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
  className?: string;
}

export default function NotificationCard({ 
  notification, 
  onClick, 
  className 
}: NotificationCardProps) {
  // Function to get notification icon based on type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'booking':
      case 'booking_confirmation':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'booking_cancellation':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'system':
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get accent color based on notification type
  const getAccentColor = () => {
    switch (notification.type) {
      case 'booking':
      case 'booking_confirmation':
        return "border-blue-500";
      case 'booking_cancellation':
        return "border-red-500";
      case 'payment':
        return "border-green-500";
      case 'review':
        return "border-yellow-500";
      case 'system':
        return "border-purple-500";
      default:
        return "border-gray-300";
    }
  };

  // Get background color based on read status and type
  const getBackgroundColor = () => {
    if (!notification.read) {
      return "bg-blue-50 hover:bg-blue-100";
    }
    
    switch (notification.type) {
      case 'booking_confirmation':
        return "hover:bg-blue-50";
      case 'booking_cancellation':
        return "hover:bg-red-50";
      case 'payment':
        return "hover:bg-green-50";
      case 'review':
        return "hover:bg-yellow-50";
      case 'system':
        return "hover:bg-purple-50";
      default:
        return "hover:bg-gray-50";
    }
  };

  return (
    <div
      className={cn(
        "px-3 py-2 border-b border-gray-100 last:border-0 transition-all duration-200 cursor-pointer",
        getBackgroundColor(),
        !notification.read && "font-medium shadow-sm",
        className
      )}
      onClick={() => onClick && onClick(notification)}
    >
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0">
          {notification.avatar ? (
            <div className="relative">
              <img
                src={notification.avatar}
                alt=""
                className={cn(
                  "h-8 w-8 rounded-full object-cover border-2",
                  getAccentColor()
                )}
              />
              {!notification.read && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full border border-white"></span>
              )}
            </div>
          ) : (
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center border-2",
              getAccentColor(),
              !notification.read ? "bg-white" : "bg-gray-50"
            )}>
              {getNotificationIcon()}
              {!notification.read && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full border border-white"></span>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-sm text-gray-900 truncate">{notification.title}</h4>
            <div className="flex items-center text-xs text-gray-500 whitespace-nowrap ml-2">
              <Clock className="h-3 w-3 mr-1" />
              <span>{notification.time}</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.description}</p>
          
          {/* Action button for certain notification types */}
          {(notification.type === 'booking' || notification.type === 'payment') && (
            <div className="mt-1 flex justify-end">
              <button 
                className={cn(
                  "text-xs px-2 py-0.5 rounded-md",
                  notification.type === 'booking' ? "text-blue-600 bg-blue-50 hover:bg-blue-100" :
                  notification.type === 'payment' ? "text-green-600 bg-green-50 hover:bg-green-100" :
                  "text-gray-600 bg-gray-50 hover:bg-gray-100"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick && onClick(notification);
                }}
              >
                {notification.type === 'booking' ? 'Voir la réservation' : 
                 notification.type === 'payment' ? 'Voir le paiement' : 'Voir plus'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
