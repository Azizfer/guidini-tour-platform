"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClockIcon, PlusIcon, PencilIcon as PencilSquareIcon, UsersIcon, CalendarIcon } from "lucide-react"
import type { Tour } from '@/services/profileService';

interface CompletedTourCardProps {
  tour: Tour;
  index: number;
  onAddMemory: (tour: Tour) => void;
  onAddReview: (tour: Tour) => void;
  isOwnProfile: boolean;
}

export default function CompletedTourCard({ tour, index, onAddMemory, onAddReview, isOwnProfile }: CompletedTourCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-full"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col group bg-white rounded-2xl border border-gray-100">
        <div className="relative overflow-hidden">
          <img src={tour.image || "/placeholder.svg"} alt={tour.title} className="w-full h-40 object-cover" />
          <div className="absolute top-2 left-2">
            <Badge className="bg-gray-600 text-white text-xs font-medium rounded-full px-2 py-1">{tour.category}</Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-100 text-green-800 text-xs font-medium rounded-full px-2 py-1">Terminé</Badge>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-sm line-clamp-2 text-gray-900">{tour.title}</h3>
            <p className="text-gray-600 text-xs line-clamp-2 leading-relaxed">{tour.description}</p>

            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3 text-gray-500" />
                <span className="text-gray-700">{tour.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <UsersIcon className="h-3 w-3 text-gray-500" />
                <span className="text-gray-700">Max {tour.maxParticipants}</span>
              </div>
            </div>

            {/* Add date and time for completed tours */}
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3 text-gray-500" />
                <span className="text-gray-700">{tour.completedDate || "2025-04-10"}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3 text-gray-500" />
                <span className="text-gray-700">{tour.completedTime || "15:30"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
            <div className="text-base font-bold text-gray-500">{tour.price} TND</div>
          </div>
        </CardContent>

        {/* Improved hover overlay - lighter version */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-2xl border border-gray-200"
          >
            <div className="flex flex-col gap-2 px-4">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg px-4 py-2 text-xs font-medium shadow-sm w-full"
                onClick={() => onAddMemory(tour)}
              >
                <PlusIcon className="h-3 w-3 mr-2" />
                Ajouter souvenir
              </Button>
              {!isOwnProfile && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white border-0 rounded-lg px-4 py-2 text-xs font-medium shadow-sm w-full"
                  onClick={() => onAddReview(tour)}
                >
                  <PencilSquareIcon className="h-3 w-3 mr-2" />
                  Ajouter avis
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  )
}
