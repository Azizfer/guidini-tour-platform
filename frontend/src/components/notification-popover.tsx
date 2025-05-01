"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Bell, Check, Calendar, Star, User, MapPin, X } from "lucide-react"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: "booking" | "review" | "system" | "message"
  read: boolean
}

const dummyNotifications: Notification[] = [
  {
    id: "1",
    title: "Réservation confirmée",
    description: "Votre réservation pour l'excursion à Carthage a été confirmée.",
    time: "Il y a 10 minutes",
    type: "booking",
    read: false,
  },
  {
    id: "2",
    title: "Nouvel avis",
    description: "Ahmed a laissé un avis 5 étoiles sur votre profil.",
    time: "Il y a 2 heures",
    type: "review",
    read: false,
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
  },
]

export default function NotificationPopover() {
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications)

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
        return <Calendar className="h-5 w-5 text-blue-400" />
      case "review":
        return <Star className="h-5 w-5 text-yellow-400" />
      case "message":
        return <User className="h-5 w-5 text-purple-400" />
      default:
        return <MapPin className="h-5 w-5 text-teal-400" />
    }
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <Bell className="h-4 w-4 text-teal-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-teal-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
            )}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-7 px-2"
            >
              <Check className="h-3 w-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="max-h-[350px]">
        {notifications.length > 0 ? (
          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 mb-1 rounded-md hover:bg-gray-50 transition-colors relative ${
                  !notification.read ? "bg-teal-50" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-800">{notification.title}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="text-gray-500 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{notification.description}</p>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                </div>
                {!notification.read && (
                  <div className="absolute right-2 bottom-2 h-2 w-2 rounded-full bg-teal-500"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>Aucune notification</p>
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-gray-200 text-center">
        <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 w-full" asChild>
          <a href="/notifications">Voir toutes les notifications</a>
        </Button>
      </div>
    </div>
  )
}
