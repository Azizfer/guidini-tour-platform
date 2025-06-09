"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPinIcon, ImageIcon as PhotoIcon, StarIcon, CalendarIcon } from "lucide-react"
import { motion } from "framer-motion"
import ReviewsList from "./reviews-list"

interface UserProfile {
  id: string
  name: string
  userType: "guide" | "tourist"
  // ... other profile properties
}

interface TouristProfileContentProps {
  profile: UserProfile
}

export default function TouristProfileContent({ profile }: TouristProfileContentProps) {
  const [activeTab, setActiveTab] = useState("trips")

  // Mock data for tourist
  const pastTrips = [
    {
      id: "1",
      title: "Exploration de Sidi Bou Saïd",
      guide: "Ahmed Ben Salem",
      date: "2024-01-15",
      location: "Sidi Bou Saïd",
      image: "/placeholder.svg?height=200&width=300",
      rating: 5,
      hasReview: true,
    },
    {
      id: "2",
      title: "Visite des ruines de Carthage",
      guide: "Fatma Trabelsi",
      date: "2024-01-10",
      location: "Carthage",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4,
      hasReview: true,
    },
  ]

  const upcomingTrips = [
    {
      id: "3",
      title: "Tour gastronomique de Tunis",
      guide: "Mohamed Khelifi",
      date: "2024-02-20",
      location: "Tunis",
      image: "/placeholder.svg?height=200&width=300",
      price: 85,
    },
  ]

  const TripCard = ({ trip, isPast = false }: any) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white rounded-2xl border border-gray-100">
      <div className="relative overflow-hidden">
        <img src={trip.image || "/placeholder.svg"} alt={trip.title} className="w-full h-48 object-cover" />
        <div className="absolute top-3 left-3">
          <Badge
            className={`${isPast ? "bg-gray-600" : "bg-green-600"} text-white text-xs font-medium rounded-full px-3 py-1`}
          >
            {isPast ? "Terminé" : "À venir"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-gray-900">{trip.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4" />
            <span>{trip.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span>{new Date(trip.date).toLocaleDateString("fr-FR")}</span>
          </div>
          <p className="text-sm text-gray-600">Guide: {trip.guide}</p>

          {isPast && trip.rating && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${i < trip.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
          )}

          {!isPast && trip.price && <div className="text-xl font-bold text-gray-900">{trip.price} TND</div>}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-xl p-1 mb-8 shadow-sm">
        <TabsTrigger
          value="trips"
          className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg text-sm font-medium"
        >
          <MapPinIcon className="h-4 w-4" />
          Voyages
        </TabsTrigger>
        <TabsTrigger
          value="memories"
          className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg text-sm font-medium"
        >
          <PhotoIcon className="h-4 w-4" />
          Souvenirs
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg text-sm font-medium"
        >
          <StarIcon className="h-4 w-4" />
          Avis donnés
        </TabsTrigger>
      </TabsList>

      {/* Trips Tab */}
      <TabsContent value="trips">
        <div className="space-y-8">
          {/* Upcoming Trips */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voyages à venir ({upcomingTrips.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <TripCard trip={trip} isPast={false} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Past Trips */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Voyages passés ({pastTrips.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTrips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <TripCard trip={trip} isPast={true} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Memories Tab */}
      <TabsContent value="memories">
        <div className="text-center py-16">
          <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun souvenir pour le moment</h3>
          <p className="text-gray-500 mb-6">Partagez vos plus beaux moments de voyage</p>
          <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
            Ajouter des souvenirs
          </Button>
        </div>
      </TabsContent>

      {/* Reviews Tab */}
      <TabsContent value="reviews">
        <ReviewsList isTourist={true} />
      </TabsContent>
    </Tabs>
  )
}
