"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Clock, Users, Star } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ReservationModal from "./reservation-popover"

interface ActivityCardProps {
  activity: {
    id: number | string
    title: string
    image: string
    description: string
    longDescription?: string
    duration: string
    price: number
    rating: number
    reviewCount: number
    maxParticipants: number
    dates?: string[]
    category: string
    location: string
  }
  index: number
  hoveredId: number | string | null
  setHoveredId: (id: number | string | null) => void
}

export default function ActivityCard({ activity, index, hoveredId, setHoveredId }: ActivityCardProps) {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)
  const [isReserved, setIsReserved] = useState(false)

  const handleReservationComplete = (reservationData: any) => {
    console.log("Reservation completed:", reservationData)
    // Here you would typically send the data to your backend
    setIsReserved(true)

    // Reset after 5 seconds for demo purposes
    setTimeout(() => {
      setIsReserved(false)
    }, 5000)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -5 }}
        onMouseEnter={() => setHoveredId(activity.id)}
        onMouseLeave={() => setHoveredId(null)}
        className="group"
      >
        <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-xl h-full flex flex-col">
          <div className="relative h-40 overflow-hidden">
            <img
              src={activity.image || "/placeholder.svg"}
              alt={activity.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
              <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm">{activity.category}</Badge>
              <Badge className="bg-teal-500/90 text-white backdrop-blur-sm">{activity.price} DT</Badge>
            </div>

            {isReserved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-3 right-3"
              >
                <Badge className="bg-green-500/90 text-white backdrop-blur-sm px-3 py-1">Réservé</Badge>
              </motion.div>
            )}
          </div>

          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-base font-bold line-clamp-2 group-hover:text-teal-600 transition-colors">
              {activity.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-1 flex-grow">
            <p className="text-gray-600 text-xs line-clamp-2 mb-2">{activity.description}</p>
            <div className="flex flex-wrap gap-y-1 text-xs text-gray-500">
              <div className="flex items-center w-1/2">
                <Clock className="h-3 w-3 mr-1 text-teal-500" />
                <span>{activity.duration}</span>
              </div>
              <div className="flex items-center w-1/2">
                <Users className="h-3 w-3 mr-1 text-teal-500" />
                <span>Max {activity.maxParticipants}</span>
              </div>
              <div className="flex items-center w-full mt-1">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                <span>
                  {activity.rating}
                  <span className="text-gray-400 ml-1">({activity.reviewCount} avis)</span>
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-3">
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-sm h-9"
              onClick={() => setIsReservationModalOpen(true)}
            >
              Réserver
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Reservation Modal */}
      <ReservationModal
        activity={activity}
        isOpen={isReservationModalOpen}
        closeModal={() => setIsReservationModalOpen(false)}
        onReservationComplete={handleReservationComplete}
      />
    </>
  )
}
