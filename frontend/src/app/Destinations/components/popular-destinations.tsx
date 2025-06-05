"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import LoadingScreen from "@/components/loading-screen"

const destinations = [
  {
    id: 1,
    name: "Sidi Bou Said",
    subtitle: "Village bleu et blanc",
    rating: 3.5,
    image: "/placeholder.svg?height=400&width=600&text=Sidi+Bou+Said",
  },
  {
    id: 2,
    name: "Sahara Tunisien",
    subtitle: "Désert majestueux",
    rating: 3.5,
    image: "/placeholder.svg?height=400&width=600&text=Sahara",
  },
  {
    id: 3,
    name: "Carthage",
    subtitle: "Site archéologique",
    rating: 3.5,
    image: "/placeholder.svg?height=400&width=600&text=Carthage",
  },
  {
    id: 4,
    name: "Djerba",
    subtitle: "Île paradisiaque",
    rating: 3.5,
    image: "/placeholder.svg?height=400&width=600&text=Djerba",
  },
  {
    id: 5,
    name: "Kairouan",
    subtitle: "Ville sainte",
    rating: 3.5,
    image: "/placeholder.svg?height=400&width=600&text=Kairouan",
  },
]

export default function PopularDestinations() {
  const [showLoading, setShowLoading] = useState(false)
  const router = useRouter()

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
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Top Destinations</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Les raisons les plus brillantes pour lesquelles Guidini devrait être votre partenaire de voyage !
          </p>


        </motion.div>

        {/* Grid Layout like reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {/* Large card - spans 2 columns on lg screens */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 lg:row-span-2"
          >
            <div className="relative h-[380px] lg:h-[460px] rounded-3xl overflow-hidden group cursor-pointer">
              <img
                src={destinations[0].image || "/placeholder.svg"}
                alt={destinations[0].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute top-5 left-5">
                <div className="bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {destinations[0].rating}
                </div>
              </div>
              <div className="absolute bottom-5 left-5 text-white">
                <h3 className="text-2xl lg:text-3xl font-bold mb-2">{destinations[0].name}</h3>
                <p className="text-lg opacity-90">{destinations[0].subtitle}</p>
              </div>
            </div>
          </motion.div>

          {/* Smaller cards */}
          {destinations.slice(1, 5).map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="relative h-[220px] rounded-3xl overflow-hidden group cursor-pointer">
                <img
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <div className="bg-black/30 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                    {destination.rating}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                  <h3 className="text-lg font-bold mb-1">{destination.name}</h3>
                  <p className="text-sm opacity-90">{destination.subtitle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Button
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6 py-2 font-medium text-base shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => {
              setShowLoading(true)
              setTimeout(() => {
                router.push("/destinations-page")
              }, 2000)
            }}
          >
            {showLoading && <LoadingScreen />}
            Voir toutes les destinations
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
