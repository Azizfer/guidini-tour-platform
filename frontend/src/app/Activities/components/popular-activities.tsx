"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Clock, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Tour, getAllTours } from "@/services/toursService"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { useToast } from "@/components/ui/use-toast"

export default function RevisedActivities() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activities, setActivities] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const tours = await getAllTours()
        console.log('Fetched tours:', tours) // Add logging for debugging
        
        if (!Array.isArray(tours)) {
          throw new Error('Invalid response format from API')
        }

        // Filter for active tours only and limit to 4 items
        const activeActivities = tours
          .filter(tour => tour?.tourStatus === 'active')
          .slice(0, 4)
        
        if (activeActivities.length === 0) {
          console.log('No active tours found')
        }
        
        setActivities(activeActivities)
        setError(null)
      } catch (err) {
        console.error('Error fetching activities:', err)
        setError(err instanceof Error ? err.message : 'Impossible de charger les activités')
      } finally {
        setIsLoading(false)
      }
    }

    // Add retry logic
    const retryFetch = async () => {
      try {
        await fetchActivities()
      } catch (err) {
        console.error('First attempt failed, retrying...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        try {
          await fetchActivities()
        } catch (retryErr) {
          console.error('Second attempt failed:', retryErr)
          setError('Impossible de charger les activités après plusieurs tentatives')
        }
      }
    }

    retryFetch()
  }, [])

  const handleReserve = (activity: Tour) => {
    if (!isAuthenticated) {
      toast({
        title: "Veuillez vous connecter",
        description: "Vous devez être connecté pour réserver une activité.",
        variant: "destructive",
      })
      return
    }

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

  const nextSlide = () => {
    setCurrentSlide(currentSlide === 1 ? 0 : 1)
  }

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? 1 : 0)
  }

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentSlide])

  // Prepare slides - 4 activities per slide
  const slides = [activities.slice(0, 4), activities.slice(4, 8)]

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-end mb-10"
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Calendar className="h-4 w-4" />
              Activités Populaires
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Vivez des <span className="text-blue-600">Expériences</span> Uniques
            </h2>
            <p className="text-gray-600 max-w-2xl text-base">
              Découvrez nos activités authentiques avec des guides locaux passionnés
            </p>
          </div>
          <div className="hidden md:flex gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="rounded-full w-10 h-10 bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={nextSlide}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {isLoading ? (
                // Loading skeletons - 4 per slide
                Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <div key={`skeleton-${index}`} className="flex-shrink-0">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                        <div className="relative h-[160px] bg-gray-200"></div>
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
                <div className="col-span-4 flex items-center justify-center p-8">
                  <p className="text-red-500 text-lg">{error}</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="col-span-4 flex items-center justify-center p-8">
                  <p className="text-gray-500 text-lg">Aucune activité disponible pour le moment</p>
                </div>
              ) : (
                slides[currentSlide].map((activity, index) => (
                  <motion.div
                    key={activity._id || activity.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex-shrink-0"
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
                      <div className="relative h-[160px] overflow-hidden">
                        <img
                          src={activity.image || "/placeholder.svg"}
                          alt={activity.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <div className="bg-white/20 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs font-medium border border-white/30">
                            {activity.category || "Activité"}
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {activity.title}
                        </h3>
                        <p className="text-gray-600 mb-3 text-xs">{activity.location || activity.category}</p>

                        {/* Activity Details */}
                        <div className="flex flex-wrap justify-between items-center gap-y-2 mb-3 text-xs text-gray-500">
                          {/* Time */}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{activity.time || "Flexible"}</span>
                          </div>
                          {/* Date */}
                          {activity.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(activity.date).toLocaleDateString("fr-FR")}</span>
                            </div>
                          )}
                          {/* Max participants */}
                          {typeof activity.maxParticipants === "number" && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>Max {activity.maxParticipants}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-lg font-bold text-gray-900">{activity.price}</span>
                            <span className="text-gray-600 ml-1">DT</span>
                            <div className="text-xs text-gray-500">par personne</div>
                          </div>
                          <Button
                            onClick={() => handleReserve(activity)}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-1 text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            Réserver
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden justify-center gap-3 mt-8">
          <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-gray-200" onClick={prevSlide}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button size="icon" className="rounded-full w-10 h-10 bg-blue-600" onClick={nextSlide}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1].map((slideIndex) => (
            <button
              key={slideIndex}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === slideIndex ? "bg-blue-600 w-6" : "bg-gray-300"
              }`}
              onClick={() => setCurrentSlide(slideIndex)}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-2 font-medium text-base shadow-md hover:shadow-lg transition-all duration-300 group"
            onClick={() => router.push("/Activities")}
          >
            Découvrir toutes les activités
            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
