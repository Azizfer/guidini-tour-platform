"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { ChevronRight, ChevronLeft, MapPin, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

// Destinations populaires en Tunisie
const popularDestinations = [
  {
    id: 1,
    name: "Sidi Bou Said",
    description: "Village aux maisons bleues et blanches surplombant la Méditerranée",
    image: "/placeholder.svg?height=600&width=800&text=Sidi+Bou+Said",
    tags: ["Culture", "Plage", "Architecture"],
    bestTime: "Avril - Octobre",
  },
  {
    id: 2,
    name: "Djerba",
    description: "Île paradisiaque aux plages de sable fin et villages traditionnels",
    image: "/placeholder.svg?height=600&width=800&text=Djerba",
    tags: ["Plage", "Détente", "Histoire"],
    bestTime: "Mai - Septembre",
  },
  {
    id: 3,
    name: "Carthage",
    description: "Site archéologique majeur de l'ancienne civilisation carthaginoise",
    image: "/placeholder.svg?height=600&width=800&text=Carthage",
    tags: ["Histoire", "Culture", "Architecture"],
    bestTime: "Mars - Novembre",
  },
  {
    id: 4,
    name: "Sahara Tunisien",
    description: "Désert majestueux avec ses dunes dorées et oasis verdoyantes",
    image: "/placeholder.svg?height=600&width=800&text=Sahara+Tunisien",
    tags: ["Aventure", "Nature", "Expérience"],
    bestTime: "Octobre - Avril",
  },
]

export default function PopularDestinations() {
  const [destinations] = useState(popularDestinations)
  const [currentDestination, setCurrentDestination] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [direction, setDirection] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll animation references
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [100, 0, 0, 100])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0.8, 1, 1, 0.8])

  // Navigation functions
  const nextDestination = useCallback(() => {
    setDirection(1)
    setCurrentDestination((prev) => (prev + 1) % destinations.length)
  }, [destinations.length])

  const prevDestination = useCallback(() => {
    setDirection(-1)
    setCurrentDestination((prev) => (prev - 1 + destinations.length) % destinations.length)
  }, [destinations.length])

  // Rotation automatique des destinations (pause on hover)
  useEffect(() => {
    if (isHovering || !isAutoPlaying) return

    autoPlayRef.current = setInterval(() => {
      nextDestination()
    }, 6000)

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isHovering, isAutoPlaying, nextDestination])

  // Handle user interaction
  const handleUserInteraction = () => {
    setIsAutoPlaying(false)
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
  }

  // Animation variants
  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
  }

  return (
    <motion.section ref={sectionRef} className="py-20 bg-gradient-to-b from-slate-50 to-white" style={{ opacity, y }}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 fade-in"
        >
          <Badge className="mb-2 px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-800 rounded-full">
            Destinations Populaires
          </Badge>
          <h2 className="text-3xl font-bold mb-3 text-slate-900 tracking-tight">
            Explorez les Merveilles de la Tunisie
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            Découvrez les plus beaux endroits de la Tunisie, des plages paradisiaques aux sites historiques fascinants
          </p>
        </motion.div>

        <motion.div style={{ scale }} transition={{ duration: 0.5 }}>
          <div className="relative max-w-5xl mx-auto">
            {/* Navigation buttons */}
            <div className="absolute top-1/2 -left-16 transform -translate-y-1/2 z-40">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/70 hover:bg-white/90 text-slate-700 shadow-md h-10 w-10 md:h-12 md:w-12"
                onClick={() => {
                  prevDestination()
                  handleUserInteraction()
                }}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Précédent</span>
              </Button>
            </div>

            <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 z-40">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/70 hover:bg-white/90 text-slate-700 shadow-md h-10 w-10 md:h-12 md:w-12"
                onClick={() => {
                  nextDestination()
                  handleUserInteraction()
                }}
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Suivant</span>
              </Button>
            </div>

            <Card className="overflow-hidden border-none shadow-lg rounded-none bg-white">
              <CardContent className="p-0">
                <div
                  className="relative h-[400px] md:h-[450px]"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                <AnimatePresence initial={false} custom={direction} mode="wait">
                  <motion.div
                    key={currentDestination}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                    }}
                    className="absolute inset-0"
                  >
                    <div className="relative h-full overflow-hidden group">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300 z-10"></div>
                      <motion.div
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 6 }}
                        className="h-full"
                      >
                        <Image
                          src={destinations[currentDestination].image || "/placeholder.svg"}
                          alt={destinations[currentDestination].name}
                          fill
                          className="object-cover"
                          priority
                        />
                      </motion.div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20"></div>

                      <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full pl-20 pr-20 z-30">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="stagger-fade-in"
                        >
                          <div className="flex items-center mb-3 text-white/90">
                            <MapPin className="h-4 w-4 mr-1.5" />
                            <span className="text-sm font-medium uppercase tracking-wider">Tunisie</span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {destinations[currentDestination].tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-white/20 hover:bg-white/30 text-white border-transparent backdrop-blur-sm text-xs py-0.5"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <h3 className="text-xl font-bold text-white mb-1.5">
                            {destinations[currentDestination].name}
                          </h3>
                          <p className="text-white/90 mb-3 text-sm">{destinations[currentDestination].description}</p>

                          <div className="flex items-center mb-6 text-white/90">
                            <Calendar className="h-4 w-4 mr-1.5 text-white/80" />
                            <span className="text-sm">
                              Meilleure période:{" "}
                              <span className="font-medium">{destinations[currentDestination].bestTime}</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                // Utiliser une navigation côté client pour une transition plus rapide
                                const url = `/destinations/${destinations[currentDestination].id}`;
                                window.location.href = url;
                              }}
                              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 text-xs h-8 px-3 flex items-center"
                            >
                              Explorer cette destination
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

              </div>
            </CardContent>
          </Card>
            
            {/* Indicateurs de navigation */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
              {destinations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentDestination ? 1 : -1)
                    setCurrentDestination(index)
                    handleUserInteraction()
                  }}
                  className={cn(
                    "transition-all duration-300 h-2 rounded-full",
                    currentDestination === index ? "bg-slate-800 w-6" : "bg-slate-300 hover:bg-slate-400 w-2",
                  )}
                  aria-label={`Voir destination ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mt-12 fade-in"
        >
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-2 font-medium text-base shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Link href="/Destinations" className="inline-flex items-center">
              Voir toutes les destinations
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.section>
  )
}
