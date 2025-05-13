"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Star, Award, MessageCircle, ChevronLeft, ChevronRight, Calendar, Languages, MapPin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import SectionDivider from "@/components/section-divider"
import Link from "next/link"

const guides = [
  {
    id: 1,
    name: "Ahmed",
    specialty: "Histoire & Culture",
    rating: 4.9,
    reviews: 127,
    image: "/placeholder.svg?height=400&width=400&text=Ahmed",
    languages: ["Français", "Anglais", "Arabe"],
    experience: "5 ans",
    bio: "Passionné d'histoire tunisienne, Ahmed vous fera découvrir les trésors cachés de notre patrimoine culturel.",
    location: "Tunis",
    availability: "Disponible",
    responseTime: "2h",
  },
  {
    id: 2,
    name: "Sarah",
    specialty: "Gastronomie",
    rating: 4.8,
    reviews: 98,
    image: "/placeholder.svg?height=400&width=400&text=Sarah",
    languages: ["Français", "Anglais", "Italien"],
    experience: "3 ans",
    bio: "Experte en cuisine tunisienne, Sarah vous emmène dans un voyage culinaire à travers les saveurs locales.",
    location: "Sousse",
    availability: "Disponible",
    responseTime: "1h",
  },
  {
    id: 3,
    name: "Mohamed",
    specialty: "Aventure",
    rating: 4.9,
    reviews: 156,
    image: "/placeholder.svg?height=400&width=400&text=Mohamed",
    languages: ["Français", "Anglais", "Espagnol"],
    experience: "7 ans",
    bio: "Guide d'aventure expérimenté, Mohamed connaît les meilleurs spots pour des expériences inoubliables.",
    location: "Djerba",
    availability: "Disponible",
    responseTime: "3h",
  },
  {
    id: 4,
    name: "Leila",
    specialty: "Art & Artisanat",
    rating: 4.7,
    reviews: 84,
    image: "/placeholder.svg?height=400&width=400&text=Leila",
    languages: ["Français", "Anglais", "Allemand"],
    experience: "4 ans",
    bio: "Artiste dans l'âme, Leila vous fait découvrir les ateliers d'artisans et les galeries d'art locales.",
    location: "Sidi Bou Said",
    availability: "Disponible",
    responseTime: "4h",
  },
  {
    id: 5,
    name: "Karim",
    specialty: "Plongée & Sports nautiques",
    rating: 5.0,
    reviews: 112,
    image: "/placeholder.svg?height=400&width=400&text=Karim",
    languages: ["Français", "Anglais", "Arabe"],
    experience: "6 ans",
    bio: "Instructeur de plongée certifié, Karim vous emmène explorer les fonds marins de la Méditerranée.",
    location: "Tabarka",
    availability: "Disponible",
    responseTime: "2h",
  },
]

export default function PopularGuides() {
  const [currentGuide, setCurrentGuide] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
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

  const nextGuide = () => {
    setDirection(1)
    setCurrentGuide((prev) => (prev + 1) % guides.length)
  }

  const prevGuide = () => {
    setDirection(-1)
    setCurrentGuide((prev) => (prev - 1 + guides.length) % guides.length)
  }

  // Rotation automatique des guides (pause on hover)
  useEffect(() => {
    if (isHovering || !isAutoPlaying) return

    autoPlayRef.current = setInterval(() => {
      nextGuide()
    }, 5000)

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isHovering, isAutoPlaying])

  // Arrêter l'autoplay quand l'utilisateur interagit
  const handleUserInteraction = () => {
    setIsAutoPlaying(false)
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
  }

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

  return (
    <>
      <SectionDivider variant="curve" color="#f8fafc" />

      <motion.section ref={sectionRef} className="py-20 bg-gradient-to-b from-slate-50 to-white" style={{ opacity, y }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 fade-in"
          >
            <Badge className="mb-3 px-3 py-1 text-sm font-medium bg-slate-100 text-slate-800 rounded-full">
              Guides Certifiés
            </Badge>
            <h2 className="text-3xl font-bold mb-3 text-slate-900 tracking-tight">Voyagez avec des Experts Locaux</h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-base">
              Découvrez nos guides passionnés qui vous feront vivre une expérience authentique de la Tunisie
            </p>
          </motion.div>

          <motion.div style={{ scale }} transition={{ duration: 0.5 }}>
            <Card
              className="relative max-w-5xl mx-auto overflow-hidden shadow-xl rounded-2xl border-none"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <CardContent className="p-0">
                {/* Contrôles de navigation */}
                <div className="absolute top-1/2 left-6 transform -translate-y-1/2 z-10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white/90 hover:bg-white shadow-lg text-slate-700 border-slate-200 h-12 w-12"
                    onClick={() => {
                      prevGuide()
                      handleUserInteraction()
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Précédent</span>
                  </Button>
                </div>

                <div className="absolute top-1/2 right-6 transform -translate-y-1/2 z-10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-white/90 hover:bg-white shadow-lg text-slate-700 border-slate-200 h-12 w-12"
                    onClick={() => {
                      nextGuide()
                      handleUserInteraction()
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                    <span className="sr-only">Suivant</span>
                  </Button>
                </div>

                {/* Carousel de guides */}
                <div className="relative h-[450px] md:h-[450px] overflow-hidden bg-gradient-to-r from-slate-50 to-white">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={currentGuide}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      className="absolute w-full h-full"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full p-8 md:p-10">
                        <div className="flex flex-col justify-center items-center md:items-end">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                          >
                            <div className="relative">
                              <Avatar className="h-56 w-56 border-4 border-white shadow-lg">
                                <AvatarImage
                                  src={guides[currentGuide].image || "/placeholder.svg"}
                                  alt={guides[currentGuide].name}
                                />
                                <AvatarFallback className="text-4xl bg-slate-200 text-slate-800">
                                  {guides[currentGuide].name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>

                              {/* Status badge */}
                              <Badge className="absolute bottom-4 right-4 bg-emerald-500 text-white border-none px-4 py-1.5 text-sm font-medium">
                                {guides[currentGuide].availability}
                              </Badge>
                            </div>

                            <div className="mt-4 flex justify-center">
                              <div className="flex items-center">
                                <div className="flex mr-2">{renderRatingStars(guides[currentGuide].rating)}</div>
                                <span className="text-slate-800 font-medium text-lg">
                                  {guides[currentGuide].rating}
                                  <span className="text-slate-500 ml-1 font-normal">
                                    ({guides[currentGuide].reviews} avis)
                                  </span>
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        <div className="flex flex-col justify-center">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="space-y-6 stagger-fade-in"
                          >
                            <div>
                              <h3 className="text-3xl font-bold text-slate-900 mb-2">{guides[currentGuide].name}</h3>
                              <p className="text-xl text-slate-700 mb-3">{guides[currentGuide].specialty}</p>
                            </div>

                            <p className="text-slate-600 italic text-sm">"{guides[currentGuide].bio}"</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center text-slate-700">
                                <MapPin className="w-5 h-5 mr-2 text-slate-500" />
                                <span className="text-base">{guides[currentGuide].location}</span>
                              </div>

                              <div className="flex items-center text-slate-700">
                                <Award className="w-5 h-5 mr-2 text-slate-500" />
                                <span className="text-base">{guides[currentGuide].experience}</span>
                              </div>

                              <div className="flex items-center text-slate-700">
                                <MessageCircle className="w-5 h-5 mr-2 text-slate-500" />
                                <span className="text-base">Répond en {guides[currentGuide].responseTime}</span>
                              </div>

                              <div className="flex items-center text-slate-700">
                                <Calendar className="w-5 h-5 mr-2 text-slate-500" />
                                <span className="text-base">Réservation flexible</span>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center mb-3">
                                <Languages className="w-5 h-5 mr-2 text-slate-500" />
                                <span className="text-slate-700 font-medium text-base">Langues parlées</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {guides[currentGuide].languages.map((language) => (
                                  <Badge
                                    key={language}
                                    variant="outline"
                                    className="bg-white border-slate-200 text-slate-700 text-sm px-3 py-1"
                                  >
                                    {language}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-base font-medium">
                                Contacter
                                <Mail className="ml-2 h-5 w-5" />
                              </Button>

                              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-base font-medium">
                                Voir le profil
                                <ChevronRight className="ml-2 h-5 w-5" />
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
              <Link href="#" className="inline-flex items-center">
                Voir tous les guides
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </>
  )
}
