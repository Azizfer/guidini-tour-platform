"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { ChevronRight, ChevronLeft, Star, Calendar, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { useToursStore } from "@/services/toursService"
import SectionDivider from "@/components/section-divider"

export default function PopularActivities() {
  const { tours } = useToursStore()

  // Define the Activity type
  type Activity = {
    id: string
    name: string
    description: string
    image: string
    tags: string[]
    rating: number
    reviews: number
    duration: string
    groupSize: string
    startTime: string
    price: string
  }

  const [activities, setActivities] = useState<Activity[]>([])
  const [currentActivity, setCurrentActivity] = useState(0)
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

  // Prepare activities data
  useEffect(() => {
    // Filtrer les tours publics et les convertir au format attendu par le composant
    const publicTours = tours
      .filter((tour) => tour.isPublic)
      .map((tour) => ({
        id: tour.id || `tour-${Math.random().toString(36).substr(2, 9)}`, // Ensure id is always a string
        name: tour.title,
        description: tour.description,
        image: tour.image || "/placeholder.svg?height=600&width=800&text=" + encodeURIComponent(tour.title),
        tags: tour.category ? [tour.category] : ["Visite"],
        rating: tour.rating || 4.5,
        reviews: tour.reviewCount || 0,
        duration: tour.duration || "3 heures",
        groupSize: `${tour.maxParticipants || 10} personnes`,
        startTime: tour.time || "Flexible",
        price: typeof tour.price === "number" ? `${tour.price}€` : tour.price || "65€",
      }))

    // Si aucun tour public n'est disponible, utiliser des activités par défaut
    const defaultActivities =
      publicTours.length > 0
        ? publicTours
        : [
            {
              id: "default1",
              name: "Camping à Ain Drahem",
              description:
                "Découvrez la beauté naturelle des forêts tunisiennes avec une expérience de camping inoubliable au cœur de la nature",
              image: "/placeholder.svg?height=600&width=800&text=Camping+à+Ain+Drahem",
              tags: ["Nature", "Aventure", "Détente"],
              rating: 4.8,
              reviews: 124,
              duration: "2 jours",
              groupSize: "8 personnes",
              startTime: "9h00",
              price: "120€",
            },
            {
              id: "default2",
              name: "Excursion dans le désert",
              description:
                "Aventure inoubliable dans le Sahara tunisien avec balade à dos de chameau et nuit sous les étoiles",
              image: "/placeholder.svg?height=600&width=800&text=Excursion+dans+le+désert",
              tags: ["Aventure", "Nature", "Expérience"],
              rating: 4.7,
              reviews: 98,
              duration: "1 jour",
              groupSize: "12 personnes",
              startTime: "7h30",
              price: "95€",
            },
            {
              id: "default3",
              name: "Plongée à Tabarka",
              description:
                "Explorez les fonds marins spectaculaires de la Méditerranée avec des instructeurs professionnels",
              image: "/placeholder.svg?height=600&width=800&text=Plongée+à+Tabarka",
              tags: ["Mer", "Sport", "Découverte"],
              rating: 4.9,
              reviews: 87,
              duration: "4 heures",
              groupSize: "6 personnes",
              startTime: "10h00",
              price: "75€",
            },
          ]

    setActivities(defaultActivities)
  }, [tours])

  // Navigation functions
  const nextActivity = useCallback(() => {
    if (activities.length === 0) return
    setDirection(1)
    setCurrentActivity((prev) => (prev + 1) % activities.length)
  }, [activities])

  const prevActivity = useCallback(() => {
    if (activities.length === 0) return
    setDirection(-1)
    setCurrentActivity((prev) => (prev - 1 + activities.length) % activities.length)
  }, [activities])

  // Rotation automatique des activités (pause on hover)
  useEffect(() => {
    if (isHovering || !isAutoPlaying || activities.length === 0) return

    autoPlayRef.current = setInterval(() => {
      nextActivity()
    }, 6000)

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isHovering, isAutoPlaying, nextActivity, activities])

  // Handle user interaction
  const handleUserInteraction = () => {
    setIsAutoPlaying(false)
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
  }

  // Fonction pour générer les étoiles de notation
  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars = []

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-yellow-400" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>,
      )
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-yellow-400" />)
    }

    return stars
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

  if (activities.length === 0) {
    return null
  }

  return (
    <>
      <SectionDivider variant="wave" color="white" />

      <motion.section ref={sectionRef} className="py-20 bg-gradient-to-b from-white to-slate-50" style={{ opacity, y }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 fade-in"
          >
            <Badge className="mb-3 px-3 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded-full">
              Activités Populaires
            </Badge>
            <h2 className="text-3xl font-bold mb-3 text-slate-900 tracking-tight">
              Vivez des Expériences Inoubliables
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base">
              Découvrez les meilleures expériences à vivre lors de votre séjour en Tunisie
            </p>
          </motion.div>

          <motion.div style={{ scale }} transition={{ duration: 0.5 }}>
            <Card className="relative overflow-hidden max-w-5xl mx-auto border-none shadow-lg rounded-xl bg-white">
              <CardContent className="p-0">
                <div
                  className="relative h-[400px] md:h-[450px]"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={currentActivity}
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
                            src={activities[currentActivity].image || "/placeholder.svg"}
                            alt={activities[currentActivity].name}
                            fill
                            className="object-cover"
                            priority
                          />
                        </motion.div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20"></div>

                        {/* Price tag */}
                        <div className="absolute top-6 left-6 z-30">
                          <Badge className="px-3 py-1.5 text-base font-semibold bg-white text-slate-900 shadow-md">
                            {activities[currentActivity].price}
                          </Badge>
                        </div>

                        <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full pl-20 pr-20 z-30">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="stagger-fade-in"
                          >
                            <div className="flex flex-wrap gap-2 mb-4">
                              {activities[currentActivity].tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3">{activities[currentActivity].name}</h3>
                            <p className="text-white/90 mb-4 max-w-2xl text-sm">
                              {activities[currentActivity].description}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6">
                              <div className="flex items-center">
                                <div className="flex mr-1">{renderRatingStars(activities[currentActivity].rating)}</div>
                                <span className="text-white font-medium">
                                  {activities[currentActivity].rating}
                                  <span className="text-white/70 ml-1 font-normal">
                                    ({activities[currentActivity].reviews} avis)
                                  </span>
                                </span>
                              </div>

                              <div className="flex items-center text-white/90">
                                <Clock className="h-4 w-4 mr-1.5" />
                                <span>{activities[currentActivity].duration}</span>
                              </div>

                              <div className="flex items-center text-white/90">
                                <Users className="h-4 w-4 mr-1.5" />
                                <span>Max {activities[currentActivity].groupSize}</span>
                              </div>

                              <div className="flex items-center text-white/90">
                                <Calendar className="h-4 w-4 mr-1.5" />
                                <span>Départ: {activities[currentActivity].startTime}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <Button
                                asChild
                                className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 text-sm px-4 py-2"
                              >
                                <Link href="/Activities">
                                  Explorer cette activité
                                  <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation buttons */}
                  <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-40">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        prevActivity()
                        handleUserInteraction()
                      }}
                      className="rounded-full bg-white/70 hover:bg-white shadow-lg text-slate-700 border-white/40 h-10 w-10 md:h-12 md:w-12"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span className="sr-only">Activité précédente</span>
                    </Button>
                  </div>

                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-40">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        nextActivity()
                        handleUserInteraction()
                      }}
                      className="rounded-full bg-white/70 hover:bg-white shadow-lg text-slate-700 border-white/40 h-10 w-10 md:h-12 md:w-12"
                    >
                      <ChevronRight className="h-5 w-5" />
                      <span className="sr-only">Activité suivante</span>
                    </Button>
                  </div>

                  {/* Indicateurs de navigation */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
                    {activities.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setDirection(index > currentActivity ? 1 : -1)
                          setCurrentActivity(index)
                          handleUserInteraction()
                        }}
                        className={cn(
                          "transition-all duration-300 h-2 rounded-full",
                          currentActivity === index ? "bg-white w-8" : "bg-white/40 hover:bg-white/60 w-2",
                        )}
                        aria-label={`Voir activité ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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
              <Link href="/Activities">
                Voir toutes les activités
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </>
  )
}
