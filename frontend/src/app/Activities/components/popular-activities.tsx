"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tour, getAllTours } from "@/services/toursService"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { useToast } from "@/components/ui/use-toast"

export default function PopularActivities() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activities, setActivities] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const tours = await getAllTours()
        // Filter for active tours only and limit to 6 items
        const activeActivities = tours
          .filter(tour => tour.tourStatus === 'active')
          .slice(0, 4)
        setActivities(activeActivities)
        setError(null)
      } catch (err) {
        console.error('Error fetching activities:', err)
        setError('Impossible de charger les activités')
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleReserve = (activity: Tour) => {
    // Not connected
    if (!isAuthenticated) {
      toast({
        title: "Veuillez vous connecter",
        description: "Vous devez être connecté pour réserver une activité.",
        variant: "destructive",
      })
      return
    }

    // Guide trying to reserve
    if (user?.userType === "guide") {
      toast({
        title: "Action non autorisée",
        description: "Le guide ne peut pas réserver une activité.",
        variant: "destructive",
      })
      return
    }

    router.push(`/Activities?activityId=${activity._id || activity.id}`)
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8 w-full"
        >
          <div>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Profitez de ces activités</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-gray-300"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="rounded-full w-10 h-10 bg-gray-900 hover:bg-gray-800"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-3 px-4 w-full ml-0 max-w-[1200px] mx-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="flex-shrink-0 w-[280px]">
                <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                  <div className="relative h-[170px] bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-red-500">{error}</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-gray-500">Aucune activité disponible pour le moment</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <motion.div
                key={activity._id || activity.id || index}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex-shrink-0 w-[280px]"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="relative h-[170px] overflow-hidden">
                    <img
                      src={activity.image || "/placeholder.svg"}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-gray-900 mb-1">{activity.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{activity.location || activity.category}</p>
                    
                    {/* Date and Time information */}
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{activity.date}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-2 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{activity.time}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{activity.price}DT</span>
                        <span className="text-sm text-gray-600 ml-1">/Personne</span>
                      </div>
                      <Button
                        onClick={() => handleReserve(activity)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full px-4 py-1 h-auto"
                      >
                        Réserver
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="flex justify-center mt-8">
          <Button
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2 font-medium text-base shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => {
              router.push("/Activities")
            }}
          >
            Voir toutes les activités
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
