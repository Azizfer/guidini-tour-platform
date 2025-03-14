"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Check, MessageSquare, User } from "lucide-react"

// Données fictives pour les notifications
const mockNotifications = [
  {
    id: "1",
    type: "booking",
    title: "Nouvelle demande de réservation",
    message: "John Smith a réservé votre 'Visite historique de la Médina de Sousse' pour le 15 juillet 2023.",
    date: "2023-07-01T10:30:00",
    isRead: false,
    relatedId: "1",
  },
  {
    id: "2",
    type: "message",
    title: "Nouveau message",
    message: "Emma Johnson vous a envoyé un message concernant sa prochaine visite.",
    date: "2023-07-05T14:15:00",
    isRead: false,
    relatedId: "2",
  },
  {
    id: "3",
    type: "review",
    title: "Nouvel avis",
    message: "Michael Brown a laissé un avis 5 étoiles pour votre 'Visite historique de la Médina de Sousse'.",
    date: "2023-06-30T09:45:00",
    isRead: true,
    relatedId: "3",
  },
  {
    id: "4",
    type: "system",
    title: "Rappel de visite",
    message: "Vous avez une visite à venir 'Visite du Ribat et du Mausolée de Monastir' demain à 10h00.",
    date: "2023-07-19T08:00:00",
    isRead: true,
    relatedId: null,
  },
]

export default function GuideNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case "review":
        return <User className="h-5 w-5 text-yellow-500" />
      default:
        return <Check className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
        return `Aujourd'hui à ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      } else if (diffInDays === 1) {
        return `Hier à ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jours`
      } else {
        return date.toLocaleDateString()
      }
  }  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {notifications.some((notification) => !notification.isRead) && (
          <Button variant="outline" onClick={markAllAsRead}>
            Marquer tout comme lu
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Check className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune notification à afficher</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={notification.isRead ? "bg-background" : "bg-primary/5"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getNotificationIcon(notification.type)}
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                  </div>
                  <CardDescription>{formatDate(notification.date)}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p>{notification.message}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                  Supprimer
                </Button>
                {!notification.isRead && (
                  <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                    Marquer comme lu
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}