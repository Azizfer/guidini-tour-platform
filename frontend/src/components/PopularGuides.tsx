"use client"
import { Star, Award, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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
  },
]

export default function PopularGuides() {
  const [currentGuide, setCurrentGuide] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const nextGuide = () => {
    setDirection(1)
    setCurrentGuide((prev) => (prev + 1) % guides.length)
  }

  const prevGuide = () => {
    setDirection(-1)
    setCurrentGuide((prev) => (prev - 1 + guides.length) % guides.length)
  }

  // Rotation automatique des guides
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        nextGuide()
      }, 5000)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying])

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
          <h2 className="text-3xl font-bold mb-3 text-gray-800">Nos Guides Certifiés</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Voyagez avec des experts locaux passionnés qui connaissent les meilleurs endroits
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          {/* Contrôles de navigation */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white hover:bg-gray-50 rounded-full shadow-md text-teal-600 border border-gray-200"
              onClick={() => {
                prevGuide()
                handleUserInteraction()
              }}
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Précédent</span>
            </Button>
          </div>

          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white hover:bg-gray-50 rounded-full shadow-md text-teal-600 border border-gray-200"
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
          <div className="relative h-[500px] overflow-hidden">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                  <div className="flex flex-col justify-center items-center md:items-end">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative"
                    >
                      <Avatar className="h-64 w-64 border-4 border-gray-100 shadow-lg">
                        <AvatarImage
                          src={guides[currentGuide].image || "/placeholder.svg"}
                          alt={guides[currentGuide].name}
                        />
                        <AvatarFallback className="text-4xl bg-teal-500 text-white">
                          {guides[currentGuide].name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-3xl font-bold text-teal-600 mb-1">{guides[currentGuide].name}</h3>
                        <p className="text-xl text-gray-800 mb-3">{guides[currentGuide].specialty}</p>
                      </div>

                      <div className="flex items-center mb-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < Math.floor(guides[currentGuide].rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-gray-800">{guides[currentGuide].rating}</span>
                        <span className="ml-2 text-gray-500">({guides[currentGuide].reviews} avis)</span>
                      </div>

                      <p className="text-gray-600 italic">"{guides[currentGuide].bio}"</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {guides[currentGuide].languages.map((language) => (
                          <Badge key={language} variant="outline" className="bg-white border-gray-200 text-gray-700">
                            {language}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-1 text-teal-600" />
                          <span>{guides[currentGuide].experience}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1 text-teal-600" />
                          <span>Répond en 2h</span>
                        </div>
                      </div>

                      <Button className="bg-teal-500 hover:bg-teal-600 text-white mt-4 w-full md:w-auto">
                        Contacter {guides[currentGuide].name}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicateurs */}
          <div className="flex justify-center mt-8 space-x-2">
            {guides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentGuide ? 1 : -1)
                  setCurrentGuide(index)
                  handleUserInteraction()
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentGuide === index ? "bg-teal-400 w-8" : "bg-gray-300 hover:bg-teal-400/50"
                }`}
                aria-label={`Voir guide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
