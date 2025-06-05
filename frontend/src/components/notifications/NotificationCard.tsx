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
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'booking_cancellation':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'review':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'system':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  // Get accent color based on notification type
  const getAccentColor = () => {
    switch (notification.type) {
      case 'booking':
      case 'booking_confirmation':
        return "border-teal-400";
      case 'booking_cancellation':
        return "border-red-400";
      case 'payment':
        return "border-amber-400";
      case 'review':
        return "border-amber-300";
      case 'system':
        return "border-blue-400";
      default:
        return "border-blue-500";
    }
  };

  // Get background color based on read status and type
  const getBackgroundColor = () => {
    if (!notification.read) {
      return "bg-blue-800/30 hover:bg-blue-800/40";
    }
    
    switch (notification.type) {
      case 'booking_confirmation':
        return "hover:bg-blue-800/30";
      case 'booking_cancellation':
        return "hover:bg-red-900/30";
      case 'payment':
        return "hover:bg-green-900/30";
      case 'review':
        return "hover:bg-amber-900/30";
      case 'system':
        return "hover:bg-purple-900/30";
      default:
        return "hover:bg-blue-800/20";
    }
  };

  return (
    <div
      className={cn(
        "px-3 py-2 border-b border-blue-800 last:border-0 transition-all duration-200 cursor-pointer",
        getBackgroundColor(),
        !notification.read && "font-medium",
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
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-teal-400 rounded-full border border-blue-900"></span>
              )}
            </div>
          ) : (
            <div className={cn(
              "relative h-8 w-8 rounded-full flex items-center justify-center border-2",
              getAccentColor(),
              !notification.read ? "bg-blue-800/50" : "bg-blue-900/30"
            )}>
              {getNotificationIcon()}
              {!notification.read && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-teal-400 rounded-full border border-blue-900"></span>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-sm text-white truncate">{notification.title}</h4>
            <div className="flex items-center text-xs text-blue-300/70 whitespace-nowrap ml-2">
              <Clock className="h-3 w-3 mr-1" />
              <span>{notification.time}</span>
            </div>
          </div>
          <p className="text-xs text-blue-200/80 mt-0.5 line-clamp-2">{notification.description}</p>
          
          {/* Action button for certain notification types */}
          {(notification.type === 'booking' || notification.type === 'payment') && (
            <div className="mt-1 flex justify-end">
              <button 
                className={cn(
                  "text-xs px-2 py-0.5 rounded-md",
                  notification.type === 'booking' ? "text-teal-300 bg-teal-500/20 hover:bg-teal-500/30" :
                  notification.type === 'payment' ? "text-amber-300 bg-amber-500/20 hover:bg-amber-500/30" :
                  "text-blue-300 bg-blue-700/30 hover:bg-blue-700/40"
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
