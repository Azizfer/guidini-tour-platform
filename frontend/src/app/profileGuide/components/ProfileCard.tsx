"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Calendar, MessageSquare, Users, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Guide {
  name: string
  email: string
  avatar: string
  location: string
  bio: string
  rating: number
  reviewCount: number
  toursCount: number
  reservationsCount: number
  unreadNotifications: number
  unreadMessages: number
}

interface ProfileCardProps {
  guide: Guide
}

export default function ProfileCard({ guide }: ProfileCardProps) {
  // Animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={itemVariants} className="w-full md:w-1/3">
      <Card className="border border-white/20 bg-white/90 backdrop-blur-sm shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 z-0"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Avatar className="h-20 w-20 border-2 border-white/50 shadow-md">
                <AvatarImage src={guide.avatar || "/placeholder.svg"} alt={guide.name} />
                <AvatarFallback className="bg-gradient-to-br from-teal-400 to-blue-500 text-white">
                  {guide.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                {guide.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <span>{guide.location}</span>
                <Badge className="bg-teal-500/80 hover:bg-teal-500 text-white text-xs ml-2 backdrop-blur-sm">
                  Guide Certifié
                </Badge>
              </CardDescription>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="ml-1 text-sm">
                  {guide.rating} ({guide.reviewCount} avis)
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-sm text-muted-foreground mb-4">{guide.bio}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <motion.div className="flex items-center gap-2" whileHover={{ x: 5, transition: { duration: 0.2 } }}>
              <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-teal-500" />
              </div>
              <span>{guide.toursCount} Tours</span>
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ x: 5, transition: { duration: 0.2 } }}>
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <span>{guide.reservationsCount} Reservations</span>
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ x: 5, transition: { duration: 0.2 } }}>
              <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center">
                <Bell className="h-4 w-4 text-yellow-500" />
              </div>
              <span>{guide.unreadNotifications} Notifications</span>
            </motion.div>
            <motion.div className="flex items-center gap-2" whileHover={{ x: 5, transition: { duration: 0.2 } }}>
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </div>
              <span>{guide.unreadMessages} Messages</span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
