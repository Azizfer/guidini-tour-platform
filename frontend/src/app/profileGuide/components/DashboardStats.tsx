"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Star, ImageIcon } from "lucide-react"

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

interface DashboardStatsProps {
  guide: Guide
}

export default function DashboardStats({ guide }: DashboardStatsProps) {
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full md:w-2/3">
      <Card className="border border-white/20 bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              Bienvenue de nouveau, {guide.name.split(" ")[0]} !
            </CardTitle>
            <CardDescription>
              Gérez vos visites, réservations et informations de profil depuis votre tableau de bord.
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
              <Card className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-white/20 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-teal-500" />
                    Visites
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl font-bold text-teal-600">{guide.toursCount}</p>
                  <p className="text-sm text-muted-foreground">Visites actives</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-white/20 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Réservations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl font-bold text-blue-600">{guide.reservationsCount}</p>
                  <p className="text-sm text-muted-foreground">Réservations à venir</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
              <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-white/20 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Note
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl font-bold text-yellow-600">{guide.rating}</p>
                  <p className="text-sm text-muted-foreground">Basé sur {guide.reviewCount} avis</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
              <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-white/20 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-purple-500" />
                    Galerie
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-3xl font-bold text-purple-600">42</p>
                  <p className="text-sm text-muted-foreground">Photos partagées</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
