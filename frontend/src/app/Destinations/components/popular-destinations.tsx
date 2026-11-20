"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import LoadingScreen from "@/components/loading-screen"

interface Destination {
  _id: string
  name: string
  subtitle?: string
  image?: string
  category: string
}

export default function RefinedDestinations() {
  const [showLoading, setShowLoading] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [currentMainIndex, setCurrentMainIndex] = useState(0)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const router = useRouter()

  // Fetch destinations on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/destinations")
        const data = await res.json()
        if (Array.isArray(data)) {
          setDestinations(data)
        } else if (Array.isArray(data.destinations)) {
          setDestinations(data.destinations)
        } else {
          console.error("Unexpected API response", data)
        }
      } catch (e) {
        console.error("Failed to fetch destinations", e)
      }
    }
    fetchData()
  }, [])

  // Auto-rotate main destination every 4 seconds
  useEffect(() => {
    if (destinations.length === 0) return
    const interval = setInterval(() => {
      setCurrentMainIndex((prev) => (prev + 1) % destinations.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [destinations])

  if (destinations.length === 0) {
    return null
  }

  const mainDestination = destinations[currentMainIndex] as Destination
  const otherDestinations = destinations.filter((_: Destination, index: number) => index !== currentMainIndex)

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
            <MapPin className="h-3 w-3" />
            Destinations Populaires
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Explorez la <span className="text-blue-600">Tunisie</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
            Découvrez les merveilles de la Tunisie, des sites historiques aux paysages naturels époustouflants
          </p>
        </motion.div>

        {/* Enhanced Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto">
          {/* Large featured card - rotates through destinations */}
          <motion.div
            key={`main-${currentMainIndex}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 lg:row-span-2"
            onHoverStart={() => setHoveredCard(mainDestination._id)}
            onHoverEnd={() => setHoveredCard(null)}
          >
            <div className="relative h-[280px] lg:h-[320px] rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-lg transition-all duration-500">
              {mainDestination.image && (
                <motion.img
                  src={mainDestination.image}
                  alt={mainDestination.name}
                  className="w-full h-full object-cover"
                  animate={{ scale: hoveredCard === mainDestination._id ? 1.05 : 1 }}
                  transition={{ duration: 0.6 }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Category Badge */}
              <motion.div
                className="absolute top-4 left-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                  {mainDestination.category}
                </div>
              </motion.div>

              {/* Content */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <motion.h3
                  className="text-2xl font-bold mb-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {mainDestination.name}
                </motion.h3>
                <motion.p
                  className="text-base opacity-90"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {mainDestination.subtitle}
                </motion.p>
              </div>

              {/* Hover Overlay */}
              <motion.div
                className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
            </div>
          </motion.div>

          {/* Smaller cards with enhanced animations */}
          {otherDestinations.slice(0, 4).map((destination, index) => (
            <motion.div
              key={`other-${destination._id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(destination._id)}
              onHoverEnd={() => setHoveredCard(null)}
              whileHover={{ y: -5 }}
            >
              <div className="relative h-[156px] rounded-lg overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all duration-500">
                {destination.image && (
                  <motion.img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                    animate={{ scale: hoveredCard === destination._id ? 1.1 : 1 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <div className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/30">
                    {destination.category}
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <h3 className="text-sm font-bold mb-0.5">{destination.name}</h3>
                  <p className="text-xs opacity-90">{destination.subtitle}</p>
                </div>

                {/* Hover Overlay */}
                <motion.div
                  className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced CTA Button */}
        <motion.div
          className="flex justify-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300 group"
            onClick={() => {
              setShowLoading(true)
              setTimeout(() => {
                router.push("/Destinations")
              }, 2000)
            }}
          >
            {showLoading && <LoadingScreen />}
            Découvrir toutes les destinations
            <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
