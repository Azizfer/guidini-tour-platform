"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Star, Image } from "lucide-react"

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
  return (
    <Card className="w-full md:w-2/3">
      <CardHeader>
        <CardTitle>Bienvenue de nouveau, {guide.name.split(" ")[0]} !</CardTitle>
        <CardDescription>
          Gérez vos visites, réservations et informations de profil depuis votre tableau de bord.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary/10">
            <CardHeader className="p-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Visites
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-3xl font-bold">{guide.toursCount}</p>
              <p className="text-sm text-muted-foreground">Visites actives</p>
            </CardContent>
          </Card>

          <Card className="bg-green-500/10">
            <CardHeader className="p-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Réservations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-3xl font-bold">{guide.reservationsCount}</p>
              <p className="text-sm text-muted-foreground">Réservations à venir</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500/10">
            <CardHeader className="p-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5" />
                Note
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-3xl font-bold">{guide.rating}</p>
              <p className="text-sm text-muted-foreground">Basé sur {guide.reviewCount} avis</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10">
            <CardHeader className="p-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Image className="h-5 w-5" />
                Galerie
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-3xl font-bold">42</p>
              <p className="text-sm text-muted-foreground">Photos partagées</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
