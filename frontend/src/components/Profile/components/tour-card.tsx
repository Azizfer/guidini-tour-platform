"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClockIcon } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"

interface Tour {
  id: string
  title: string
  description: string
  image: string
  price: number
  duration: string
  maxParticipants: number
  rating: number
  reviewCount: number
  category: string
  nextDate?: string
  highlights: string[]
  isActive: boolean
  completedCount?: number
}

interface TourCardProps {
  tour: Tour
  index: number
  isActive?: boolean
}

export default function TourCard({ tour, index, isActive = true }: TourCardProps) {
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
            className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge
              className={`${isActive ? "bg-blue-600" : "bg-gray-600"} text-white text-xs font-medium rounded-full px-3 py-1`}
            >
              {tour.category}
            </Badge>
          </div>
          {tour.nextDate && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/90 text-gray-800 text-[11px] font-medium rounded-full px-2.5 py-0.5">
                {new Date(tour.nextDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3 flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-sm line-clamp-2 text-gray-900">{tour.title}</h3>
            <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">{tour.description}</p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-gray-700">{tour.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <StarIconSolid className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-gray-700">{tour.rating}</span>
                <span className="text-gray-500">({tour.reviewCount})</span>
              </div>
            </div>

            {tour.highlights && tour.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tour.highlights.slice(0, 3).map((highlight, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-[11px] bg-gray-50 text-gray-600 border-gray-200 rounded-full px-2 py-0.5"
                  >
                    {highlight}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <div className="text-lg font-bold text-gray-900">{tour.price} TND</div>
            <Button
              variant="default"
              size="sm"
              className={`${isActive ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"} text-white text-[11px] rounded-full px-3 py-0.5 h-[26px]`}
            >
              {isActive ? "Réserver" : "Voir détails"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
