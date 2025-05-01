"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, MapPin, Compass, Sun, Palmtree, Utensils, Camera, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Types d'expériences
const experienceTypes = [
  { name: "Plages", icon: Sun, color: "bg-blue-500" },
  { name: "Culture", icon: Compass, color: "bg-purple-500" },
  { name: "Nature", icon: Palmtree, color: "bg-green-500" },
  { name: "Gastronomie", icon: Utensils, color: "bg-orange-500" },
  { name: "Photographie", icon: Camera, color: "bg-pink-500" },
]

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("destinations")
  const [scrollY, setScrollY] = useState(0)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  // Effet de parallaxe au scroll
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Gestion de la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Recherche pour:", searchQuery)
    // Logique de recherche
  }

  // Focus sur l'input de recherche
  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Gestion du bouton de recherche avec animation
  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded)
    setTimeout(() => {
      if (!isSearchExpanded && searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, 100)
  }

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Image d'arrière-plan avec effet parallaxe */}
      <motion.div className="absolute inset-0 z-0" style={{ y: scrollY * 0.5 }}>
        <img
          src="/images/background.jpg"
          alt="Tunisia Landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </motion.div>

      {/* Contenu principal */}
      <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center text-white"
        >
          {/* Badge animé */}
          <motion.div variants={itemVariants} className="inline-block mb-6">
            <Badge className="bg-teal-500/80 hover:bg-teal-500 text-white px-4 py-1 text-sm backdrop-blur-sm">
              Explorez la Tunisie comme jamais auparavant
            </Badge>
          </motion.div>

          {/* Titre principal avec animation */}
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Découvrez la{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              Tunisie Authentique
            </span>
          </motion.h1>

          {/* Sous-titre */}
          <motion.p variants={itemVariants} className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-white/90">
            Visites guidées et excursions locales pour une expérience inoubliable au cœur de la culture tunisienne
          </motion.p>

          {/* Onglets interactifs */}
          <motion.div variants={itemVariants} className="mb-8">
            <Tabs
              defaultValue="destinations"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full max-w-2xl mx-auto"
            >
              <TabsList className="grid grid-cols-2 bg-white/10 backdrop-blur-md rounded-full p-1">
                <TabsTrigger
                  value="destinations"
                  className="rounded-full data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-md transition-colors"
                >
                  Destinations
                </TabsTrigger>
                <TabsTrigger
                  value="experiences"
                  className="rounded-full data-[state=active]:bg-white data-[state=active]:text-teal-900 data-[state=active]:shadow-md transition-colors"
                >
                  Expériences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="destinations" className="mt-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20">
                  <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <AnimatePresence>
                        {isSearchExpanded && (
                          <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "100%", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative flex-1"
                          >
                            <MapPin
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400"
                              size={18}
                            />
                            <Input
                              ref={searchInputRef}
                              type="text"
                              placeholder="Où voulez-vous partir ?"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 bg-white/20 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-teal-400 h-12"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Button
                      type={isSearchExpanded ? "submit" : "button"}
                      onClick={isSearchExpanded ? undefined : toggleSearch}
                      className={`bg-teal-500 hover:bg-teal-600 text-white h-12 transition-all duration-300 ${
                        isSearchExpanded ? "rounded-md" : "rounded-full"
                      }`}
                    >
                      {isSearchExpanded ? (
                        <>
                          Rechercher
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Rechercher
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="experiences" className="mt-4">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/20">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {experienceTypes.map((type) => (
                      <Button
                        key={type.name}
                        variant="outline"
                        onClick={() => {
                          setSearchQuery(type.name)
                          setActiveTab("destinations")
                          setTimeout(focusSearch, 100)
                        }}
                        className="flex flex-col items-center justify-center h-24 border-white/20 bg-white/5 hover:bg-white/20 text-white hover:text-white"
                      >
                        <div className={`${type.color} p-2 rounded-full mb-2`}>
                          <type.icon size={20} className="text-white" />
                        </div>
                        <span>{type.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
