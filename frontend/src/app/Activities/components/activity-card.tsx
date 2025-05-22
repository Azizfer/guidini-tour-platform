"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import PaymentCard from "./payment-card"
import ActivityDetailsPopup from "./activity-details-popup"

export interface ActivityCardProps {
  activity: {
    id: string | number
    title: string
    description: string
    image: string
    price: number
    duration: string
    maxParticipants?: number
    location: string
    dates: string[]
    category: string
    guideId?: string
  }
  index: number
}

export default function ActivityCard({ activity, index }: ActivityCardProps) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleReservation = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPaymentOpen(true)
  }

  // Format price with proper spacing and currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="group h-full"
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-xl h-full",
            "bg-white dark:bg-zinc-900",
            "border border-zinc-200/50 dark:border-zinc-800/50",
            "shadow-sm hover:shadow-md transition-all duration-300",
            "hover:border-zinc-300/50 dark:hover:border-zinc-700/50",
            "flex flex-col",
          )}
        >
          <div className="relative h-48 overflow-hidden rounded-t-xl">
            <Image
              src={activity.image || "/placeholder.svg"}
              alt={activity.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute top-3 left-3">
              <Badge
                variant="secondary"
                className="bg-white/90 text-zinc-800 dark:bg-zinc-800/90 dark:text-zinc-200 backdrop-blur-md shadow-sm"
              >
                {activity.category}
              </Badge>
            </div>

            <div className="absolute bottom-3 right-3">
              <div className="px-3 py-1.5 rounded-md text-sm font-medium bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-sm border-l-2 border-primary shadow-sm transition-all duration-300">
                {formatPrice(activity.price)}
              </div>
            </div>


          </div>

          <div className="flex-1 p-4 flex flex-col">
            <div className="space-y-2 flex-1">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-primary transition-colors">
                {activity.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{activity.description}</p>
            </div>

            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
              <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-primary" />
                {activity.duration}
              </div>
              <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary" />
                {activity.location}
              </div>
              {activity.maxParticipants && (
                <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                  <Users className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  Max {activity.maxParticipants}
                </div>
              )}
              {activity.dates && activity.dates.length > 0 && (
                <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  {new Date(activity.dates[0]).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-9 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDetailsOpen(true)
                }}
              >
                Détails
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs h-9 transition-all duration-300 group-hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleReservation}
              >
                Réserver
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-xl">
          <DialogTitle className="sr-only">Réservation pour {activity.title}</DialogTitle>
          <PaymentCard
            activity={{
              title: activity.title,
              price: activity.price,
              date: activity.dates && activity.dates.length > 0 ? activity.dates[0] : undefined,
              maxParticipants: activity.maxParticipants,
              id: activity.id,
            }}
            onCheckout={(participants) => {
              console.log(`Checkout for ${activity.title} with ${participants} participants`)
              setIsPaymentOpen(false)
              // You can add navigation or other actions here
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Details Popup */}
      <ActivityDetailsPopup 
        activity={activity} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
      />
    </>
  )
}
