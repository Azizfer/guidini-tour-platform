"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Search, MapPin, X } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import Header from "./Header"

// Decorative flower
function DecorativeFlower({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="12" cy="12" r="3" className="text-pink-300" />
      <circle cx="12" cy="6" r="2" className="text-pink-200" />
      <circle cx="18" cy="12" r="2" className="text-pink-200" />
      <circle cx="12" cy="18" r="2" className="text-pink-200" />
      <circle cx="6" cy="12" r="2" className="text-pink-200" />
    </svg>
  )
}

export default function TunisiaHeroClean() {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <Header />

      {/* Minimal decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute top-32 left-16"
        >
          <DecorativeFlower className="w-4 h-4 text-pink-200" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute top-48 right-32"
        >
          <DecorativeFlower className="w-5 h-5 text-pink-300" />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[85vh]">
          {/* Left Side - Content */}
          <div className="space-y-6">
            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-800 leading-tight">
                Aventures
                <br />
                <span className="text-blue-600">Tunisiennes</span> &
                <br />
                Évasions
                <br />
                <span className="text-blue-600">Authentiques</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg text-gray-600 max-w-lg leading-relaxed"
            >
              Planifiez et réservez votre voyage parfait avec nos conseils d'experts, informations sur les destinations
              et inspiration authentique.
            </motion.p>

            {/* Search Interface - Horizontal Layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="space-y-4"
            >
              {/* Location Field removed */}

              {/* Action Buttons with Animated Search */}
              <div className="flex items-center gap-3">
                <motion.div layout className="flex items-center gap-3">
                  {/* Search Button - Only show when search is not active */}
                  <AnimatePresence>
                    {!showSearch && (
                      <motion.div
                        initial={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <Button
                          size="lg"
                          className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0"
                          onClick={() => setShowSearch(true)}
                        >
                          <Search className="mr-2 h-5 w-5" />
                          Rechercher
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Animated Search Field */}
                  <AnimatePresence>
                    {showSearch && (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "300px", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="relative overflow-hidden"
                      >
                        <Input
                          type="search"
                          placeholder="Rechercher destinations..."
                          className="w-full pl-4 pr-10 py-3 text-base rounded-xl border-2 border-gray-300 focus:border-gray-400 bg-white shadow-lg"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 h-8 w-8"
                          onClick={() => setShowSearch(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Map Button - Animates to the right */}
                  <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-4 py-3 rounded-xl transition-all duration-300 flex-shrink-0"
                      asChild
                    >
                      <Link href="/carte-interactive">
                        {!showSearch ? (
                          <>
                            <MapPin className="h-5 w-5 mr-2" />
                            <span>Explorez la map</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-5 w-5" />
                            <span className="sr-only">Carte interactive</span>
                          </>
                        )}
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right Side - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            {/* Large Blue Circle Background */}
            <div className="relative w-full h-[500px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full transform rotate-12 scale-95"></div>

              {/* Traveler Image Placeholder */}
              <div className="relative z-10 w-80 h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-24 h-24 bg-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">👤</span>
                  </div>
                  <p className="text-sm">Voyageur en Tunisie</p>
                  <p className="text-xs mt-1">Chapeau traditionnel</p>
                  <p className="text-xs">& sac de voyage</p>
                </div>
              </div>

              {/* Floating UI Elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute top-20 right-10 bg-white rounded-lg p-3 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Sidi Bou Saïd</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute bottom-20 left-10 bg-white rounded-lg p-4 shadow-lg min-w-[200px]"
              >
                <div className="w-full h-24 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-white font-medium">Carthage</span>
                </div>
                <p className="text-sm font-medium text-gray-800">Site archéologique</p>
                <div className="flex items-center mt-2 space-x-1">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
