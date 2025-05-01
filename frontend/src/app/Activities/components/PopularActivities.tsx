"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Activités populaires en Tunisie
const popularActivities = [
  {
    id: 1,
    name: "Camping à Ain Drahem",
    description: "Découvrez la beauté naturelle des forêts tunisiennes",
    image: "/placeholder.svg?height=600&width=800&text=Camping+à+Ain+Drahem",
    tags: ["Nature", "Aventure", "Détente"],
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: "Excursion dans le désert",
    description: "Aventure inoubliable dans le Sahara",
    image: "/placeholder.svg?height=600&width=800&text=Excursion+dans+le+désert",
    tags: ["Aventure", "Nature", "Expérience"],
    rating: 4.7,
    reviews: 98,
  },
  {
    id: 3,
    name: "Tour gastronomique",
    description: "Découverte des saveurs tunisiennes",
    image: "/placeholder.svg?height=600&width=800&text=Tour+gastronomique",
    tags: ["Gastronomie", "Culture", "Détente"],
    rating: 4.9,
    reviews: 156,
  },
  {
    id: 4,
    name: "Plongée à Tabarka",
    description: "Explorez les fonds marins méditerranéens",
    image: "/placeholder.svg?height=600&width=800&text=Plongée+à+Tabarka",
    tags: ["Sport", "Mer", "Aventure"],
    rating: 4.6,
    reviews: 87,
  },
]

export default function PopularActivities() {
  const [currentActivity, setCurrentActivity] = useState(0)

  // Rotation automatique des activités
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % popularActivities.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3 text-gray-800">Activités Populaires</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les meilleures expériences à vivre lors de votre séjour en Tunisie
          </p>
        </motion.div>

        <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {popularActivities.map(
              (activity, index) =>
                currentActivity === index && (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0 hover:scale-105 transition-transform duration-300"
                  >
                    <div className="relative h-full">
                      <img
                        src={activity.image || "/placeholder.svg"}
                        alt={activity.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                      <div className="absolute bottom-0 left-0 p-8 w-full">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {activity.tags.map((tag) => (
                            <Badge key={tag} className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">{activity.name}</h3>
                        <p className="text-white/80 mb-2 max-w-2xl">{activity.description}</p>
                        <div className="flex items-center mb-4">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="text-white">
                            {activity.rating}
                            <span className="text-white/70 ml-1">({activity.reviews} avis)</span>
                          </span>
                        </div>
                        <Link href="/activities">
                          <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                            Explorer cette activité
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ),
            )}
          </AnimatePresence>

          {/* Indicateurs de navigation */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            {popularActivities.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentActivity(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentActivity === index ? "bg-teal-400 w-6" : "bg-white/50 hover:bg-white",
                )}
                aria-label={`Voir activité ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mt-10"
        >
          <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-600 text-white font-medium">
            <Link href="/Activities">
              Voir toutes les activités
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
