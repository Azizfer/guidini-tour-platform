"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Star, Briefcase, MapPin, Languages, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import guideService, { type Guide } from "@/services/guideService"
import { useChat } from "@/contexts/chat-context"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function RevisedGuides() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { openChat } = useChat()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleContactGuide = (guide: Guide) => {
    if (!isAuthenticated) {
      toast({
        title: "Veuillez vous connecter",
        description: "Vous devez être connecté pour contacter un guide.",
        variant: "destructive",
      })
      return
    }

    if (guide && guide._id) {
      const chatUser = {
        id: guide._id,
        name: guide.name,
        avatar: guide.profileImage || guide.avatar,
        online: false,
      }
      openChat(chatUser)
    }
  }

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setIsLoading(true)
        const guidesData = await guideService.getAllGuides()
        setGuides(guidesData)
        setError(null)
      } catch (err) {
        console.error("Error fetching guides:", err)
        setError("Impossible de charger les guides")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuides()
  }, [])

  const nextSlide = () => {
    setCurrentSlide(currentSlide === 1 ? 0 : 1)
  }

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? 1 : 0)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentSlide])

  const slides = [guides.slice(0, 4), guides.slice(4, 8)]

  const renderRatingStars = (rating = 0) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars = []

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-3 w-3 text-amber-400 fill-amber-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-3 w-3 text-amber-400" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
          </div>
        </div>
      )
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-amber-400" />)
    }

    return stars
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <Badge className="mb-4 px-4 py-2 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
            Guides Certifiés
          </Badge>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Voyagez avec des Experts Locaux</h2>
            <div className="hidden md:flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 border-gray-300"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                className="rounded-full w-10 h-10 bg-indigo-600 hover:bg-indigo-700"
                onClick={nextSlide}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-base">
            Découvrez nos guides passionnés qui vous feront vivre une expérience authentique
          </p>
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
                Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <div key={`skeleton-${index}`} className="h-[360px]">
                      <div className="bg-white rounded-2xl p-4 shadow-md animate-pulse h-full flex flex-col">
                        <div className="relative mb-3 flex justify-center">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200"></div>
                        </div>
                        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto mb-3"></div>
                        <div className="h-10 bg-gray-200 rounded w-full mx-auto mb-3"></div>
                        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
                        <div className="mt-auto flex gap-2">
                          <div className="h-8 bg-gray-200 rounded w-full"></div>
                          <div className="h-8 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : error ? (
                <div className="col-span-4 flex items-center justify-center p-6">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : guides.length === 0 ? (
                <div className="col-span-4 flex items-center justify-center p-6">
                  <p className="text-gray-500">Aucun guide disponible pour le moment</p>
                </div>
              ) : (
                slides[currentSlide].map((guide, index) => (
                  <motion.div
                    key={guide._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="h-[360px]"
                  >
                    <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 text-center h-full flex flex-col">
                      <div className="relative mb-3 flex justify-center">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-100">
                          <img
                            src={guide.profileImage || guide.avatar || "/placeholder.svg"}
                            alt={guide.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-white shadow-md border border-amber-100">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-medium text-gray-900">
                              {typeof guide.rating === "number" ? guide.rating.toFixed(1) : "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-1 text-base">{guide.name}</h3>
                      <div className="flex flex-wrap gap-1 justify-center mb-2">
                        {guide.expertise && guide.expertise.length > 0 ? (
                          guide.expertise.map((area) => (
                            <Badge
                              key={area}
                              className="bg-indigo-100 text-indigo-800 border-none px-3 py-0.5 text-xs font-medium capitalize"
                            >
                              {area}
                            </Badge>
                          ))
                        ) : (
                          <Badge className="bg-indigo-100 text-indigo-800 border-none px-3 py-0.5 text-xs font-medium capitalize">
                            Guide Professionnel
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-center text-gray-600 mb-1">
                        <MapPin className="h-3 w-3 mr-1 text-indigo-500" />
                        <span className="text-xs">{guide.location || "Tunisie"}</span>
                      </div>
                      <div className="flex items-center justify-center text-gray-600 mb-1">
                        <Briefcase className="h-3 w-3 mr-1 text-indigo-500" />
                        <span className="text-xs">{(guide.yearsOfExperience ?? guide.experience ?? 0)} ans d'expérience</span>
                      </div>
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2 italic">
                        "{guide.bio || guide.description || "Guide professionnel passionné par la culture tunisienne"}"
                      </p>
                      <div className="flex items-center justify-center mb-1">
                        <Languages className="h-3 w-3 mr-1 text-indigo-500" />
                        <span className="text-gray-700 font-medium text-xs">Langues parlées</span>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {guide.languages && guide.languages.length > 0 ? (
                          guide.languages.slice(0, 2).map((language) => (
                            <Badge
                              key={language}
                              variant="outline"
                              className="bg-gray-50 border-gray-200 text-gray-700 text-xs px-2 py-0.5 capitalize"
                            >
                              {language}
                            </Badge>
                          ))
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 border-gray-200 text-gray-700 text-xs px-2 py-0.5 capitalize"
                          >
                            Français
                          </Badge>
                        )}
                      </div>

                      <div className="mt-auto flex gap-2">
                        <Button
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full py-1.5 text-xs font-medium"
                          onClick={() => handleContactGuide(guide)}
                        >
                          <MessageCircle className="mr-1 h-3 w-3" />
                          Contacter
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-full py-1.5 text-xs font-medium"
                          asChild
                        >
                          <Link href={`/Profile/${guide._id}`}>Profil</Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex md:hidden justify-center gap-3 mt-8">
          <Button variant="outline" size="icon" className="rounded-full w-10 h-10 border-gray-200" onClick={prevSlide}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button size="icon" className="rounded-full w-10 h-10 bg-indigo-600" onClick={nextSlide}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {[0, 1].map((slideIndex) => (
            <button
              key={slideIndex}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === slideIndex ? "bg-indigo-600 w-6" : "bg-gray-300"
              }`}
              onClick={() => setCurrentSlide(slideIndex)}
            />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2 font-medium text-base shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => router.push("/Guides")}
          >
            Voir tous les guides
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}