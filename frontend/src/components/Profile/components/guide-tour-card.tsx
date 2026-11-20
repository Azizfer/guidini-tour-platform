"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClockIcon, UsersIcon, CalendarIcon } from "lucide-react"

interface Tour {
  id: string
  title: string
  description: string
  image: string
  price: number
  duration: string
  maxParticipants: number
  category: string
  nextDate?: string
  date?: string
  time?: string
  highlights: string[]
  isActive: boolean
  completedCount?: number
}

interface GuideTourCardProps {
  tour: Tour
  index: number
  isActive?: boolean
}

export default function GuideTourCard({ tour, index, isActive = true }: GuideTourCardProps) {
  const displayDate = tour.nextDate || tour.date;
  const displayTime = tour.time;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col group bg-white rounded-2xl border border-gray-100">
        <div className="relative overflow-hidden">
          <img
            src={tour.image || "/placeholder.svg"}
            alt={tour.title}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <Badge
              className={`${isActive ? "bg-blue-600" : "bg-gray-600"} text-white text-xs font-medium rounded-full px-2 py-1`}
            >
              {tour.category}
            </Badge>
          </div>
          {displayDate && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-white/90 text-gray-800 text-xs font-medium rounded-full px-2 py-1">
                {new Date(displayDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-sm line-clamp-2 text-gray-900">{tour.title}</h3>
            <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">{tour.description}</p>

            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3 text-blue-500" />
                <span className="text-gray-700">{tour.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <UsersIcon className="h-3 w-3 text-blue-500" />
                <span className="text-gray-700">Max {tour.maxParticipants}</span>
              </div>
            </div>

            {/* Date and time information with icons in a row */}
            {displayDate && (
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 text-blue-500" />
                  <span className="text-gray-700">{displayDate}</span>
                </div>
                {displayTime && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3 text-blue-500" />
                    <span className="text-gray-700">{displayTime}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <div className="text-base font-bold text-gray-900">{tour.price} TND</div>
            <Button
              variant="default"
              size="sm"
              className={`${isActive ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"} text-white text-xs rounded-full px-3 py-1 h-auto`}
            >
              {isActive ? "Réserver" : "Voir détails"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
