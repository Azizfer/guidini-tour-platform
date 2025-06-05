"use client"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import guideService, { Guide } from "@/services/guideService"
import { useChat } from "@/contexts/chat-context"
import { useRouter } from "next/navigation"
import LoadingScreen from "@/components/loading-screen"

export default function PopularGuides() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [guides, setGuides] = useState<Guide[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { openChat } = useChat()
  const [showLoading, setShowLoading] = useState(false)
  const router = useRouter()

  // Handle contact guide button click
  const handleContactGuide = (guide: Guide) => {
    if (guide && guide._id) {
      // Create a ChatUser object from the guide data
      const chatUser = {
        id: guide._id,
        name: guide.name,
        avatar: guide.profileImage || guide.avatar,
        online: false
      }
      // Open chat with the selected guide
      openChat(chatUser)
    }
  }

  // Fetch guides data from the API
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setIsLoading(true)
        const guidesData = await guideService.getAllGuides()
        setGuides(guidesData)
        setError(null)
      } catch (err) {
        console.error('Error fetching guides:', err)
        setError('Impossible de charger les guides')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuides()
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const scrollAmount = 320 // One card width
        scrollRef.current.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        })

        // Reset to beginning if we've reached the end
        if (scrollRef.current.scrollLeft + scrollRef.current.clientWidth >= scrollRef.current.scrollWidth - 50) {
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
            }
          }, 2000)
        }
      }
    }, 4000) // Auto-slide every 4 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
            Guides Certifiés
          </Badge>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Voyagez avec des Experts Locaux</h2>
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
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto hidden">
            Découvrez nos guides passionnés qui vous feront vivre une expérience authentique
          </p>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-6 ml-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
              <div key={`skeleton-${index}`} className="flex-shrink-0 w-[260px] h-[380px]">
                <div className="bg-white rounded-2xl p-4 shadow-lg animate-pulse h-full flex flex-col">
                  <div className="relative mb-3 flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-3"></div>
                  <div className="h-12 bg-gray-200 rounded w-full mx-auto mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
                  <div className="mt-auto flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-red-500">{error}</p>
            </div>
          ) : guides.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-gray-500">Aucun guide disponible pour le moment</p>
            </div>
          ) : (
            guides.map((guide, index) => (
              <motion.div
                key={guide._id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-shrink-0 w-[260px] h-[380px]"
              >
              <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 text-center h-full flex flex-col">
                <div className="relative mb-3 flex justify-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    <img
                      src={guide.profileImage || guide.avatar || "/placeholder.svg"}
                      alt={guide.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2">
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-white shadow-md border">
                      <span className="text-xs font-medium text-gray-900">{guide.rating || '-'}</span>
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-1 text-lg">{guide.name}</h3>
                <div className="flex justify-center mb-2">
                  <Badge className="bg-gray-100 text-gray-800 border-none px-3 py-1 text-xs font-medium">
                    {guide.expertise && guide.expertise.length > 0 
                      ? guide.expertise.slice(0, 2).join(' · ') 
                      : 'Guide Professionnel'}
                  </Badge>
                </div>

                <div className="flex items-center justify-center text-gray-600 mb-1">
                  <span className="text-sm">{guide.location || ''}</span>
                </div>

                <p className="text-gray-600 text-xs mb-3 line-clamp-2">{guide.bio || guide.description || ''}</p>

                <div className="mb-3">
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-gray-700 font-medium text-sm">Langues</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {guide.languages && guide.languages.length > 0 
                      ? guide.languages.slice(0, 2).map((language) => (
                          <Badge
                            key={language}
                            variant="outline"
                            className="bg-gray-50 border-gray-200 text-gray-700 text-xs px-2 py-1"
                          >
                            {language}
                          </Badge>
                        ))
                      : null
                    }
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <Button 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full py-1.5 text-sm font-medium"
                    onClick={() => handleContactGuide(guide)}
                  >
                    Contacter
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-full py-1.5 text-sm font-medium"
                    asChild
                  >
                    <Link href={`/guides/${guide._id}`}>
                      Profil
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )))}
        </div>

        <div className="flex justify-center mt-12">
          <Button
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2 font-medium text-base shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => {
              setShowLoading(true)
              setTimeout(() => {
                router.push("/guides")
              }, 2000)
            }}
          >
            {showLoading && <LoadingScreen />}
            Voir tous les guides
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
