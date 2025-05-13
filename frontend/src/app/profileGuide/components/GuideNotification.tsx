"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Check, MessageSquare, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500"
        >
          Notifications
        </motion.h2>
        {notifications.some((notification) => !notification.isRead) && (
          <motion.div variants={itemVariants}>
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="border border-teal-200 hover:bg-teal-50 text-teal-600"
            >
              Marquer tout comme lu
            </Button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        <motion.div variants={containerVariants} className="space-y-4">
          {notifications.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="bg-white/90 backdrop-blur-sm border border-white/20">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Check className="h-10 w-10 text-teal-500 mb-4" />
                  <p className="text-muted-foreground">Aucune notification à afficher</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, x: -100 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card
                  className={`${
                    notification.isRead ? "bg-white/90" : "bg-gradient-to-r from-teal-50/90 to-blue-50/90"
                  } backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-md transition-all duration-300`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                      </div>
                      <CardDescription>
                        <Badge className="bg-teal-500/80 hover:bg-teal-500 text-white text-xs backdrop-blur-sm">
                          {formatDate(notification.date)}
                        </Badge>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{notification.message}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      Supprimer
                    </Button>
                    {!notification.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="border-teal-200 hover:bg-teal-50 text-teal-600"
                      >
                        Marquer comme lu
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
