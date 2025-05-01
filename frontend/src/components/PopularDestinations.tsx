"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Destinations populaires en Tunisie
const popularDestinations = [
  {
    id: 1,
    name: "Sidi Bou Said",
    description: "Village aux maisons bleues et blanches surplombant la Méditerranée",
    image: "/placeholder.svg?height=600&width=800&text=Sidi+Bou+Said",
    tags: ["Culture", "Plage", "Architecture"],
  },
  {
    id: 2,
    name: "Djerba",
    description: "Île paradisiaque aux plages de sable fin et villages traditionnels",
    image: "/placeholder.svg?height=600&width=800&text=Djerba",
    tags: ["Plage", "Détente", "Histoire"],
  },
  {
    id: 3,
    name: "Carthage",
    description: "Site archéologique majeur de l'ancienne civilisation carthaginoise",
    image: "/placeholder.svg?height=600&width=800&text=Carthage",
    tags: ["Histoire", "Culture", "Architecture"],
  },
  {
    id: 4,
    name: "Sahara Tunisien",
    description: "Désert majestueux avec ses dunes dorées et oasis verdoyantes",
    image: "/placeholder.svg?height=600&width=800&text=Sahara+Tunisien",
    tags: ["Aventure", "Nature", "Expérience"],
  },
]

export default function PopularDestinations() {
  const [currentDestination, setCurrentDestination] = useState(0)

  // Rotation automatique des destinations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDestination((prev) => (prev + 1) % popularDestinations.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 bg-[#f8f7f4]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3 text-gray-800">Destinations Populaires</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les plus beaux endroits de la Tunisie, des plages paradisiaques aux sites historiques fascinants
          </p>
        </motion.div>

        <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {popularDestinations.map(
              (destination, index) =>
                currentDestination === index && (
                  <motion.div
                    key={destination.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0 hover:scale-105 transition-transform duration-300"
                  >
                    <div className="relative h-full">
                      <img
                        src={destination.image || "/images/Photo de carthage.jpg"}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                      <div className="absolute bottom-0 left-0 p-8 w-full">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {destination.tags.map((tag) => (
                            <Badge key={tag} className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-2">{destination.name}</h3>
                        <p className="text-white/80 mb-4 max-w-2xl">{destination.description}</p>
                        <Link href="/Destinations">
                          <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                            Explorer cette destination
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
            {popularDestinations.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentDestination(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentDestination === index ? "bg-teal-400 w-6" : "bg-white/50 hover:bg-white",
                )}
                aria-label={`Voir destination ${index + 1}`}
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
            <Link href="/Destinations">
              Voir toutes les destinations
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
