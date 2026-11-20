"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Search,
  MapPin,
  Award,
  Filter,
  ChevronDown,
  Calendar,
  Languages,
  Mail,
  Compass,
  Palmtree,
  Star,
  StarHalf,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import guideService, { Guide } from "@/services/guideService"
import { useChat } from "@/contexts/chat-context"
import Link from "next/link"

const sortOptions = [
  { label: "Meilleures notes", value: "rating" },
  { label: "Plus d'expérience", value: "experience" },
]

export default function AllGuides() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(["Toutes"])
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["Tous"])
  const [sortBy, setSortBy] = useState("rating")
  const [visibleCount, setVisibleCount] = useState(4)
  const [specialties, setSpecialties] = useState<string[]>(["Toutes"])
  const [locations, setLocations] = useState<string[]>(["Tous"])
  const { openChat, refreshConversations } = useChat()

  // Handle contact guide button click
  const handleContactGuide = (guide: Guide) => {
    if (guide && guide._id) {
      // Create a ChatUser object from the guide data
      const chatUser = {
        id: guide._id,
        name: guide.name,
        avatar: guide.profileImage || guide.avatar || "/placeholder.svg",
        online: true
      }
      // Open chat with the selected guide
      openChat(chatUser)
      
      // Refresh conversations after opening chat
      refreshConversations().catch(error => {
        console.error('Background refresh error:', error)
      })
    }
  }

  // Fetch guides data from API
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true)
        const data = await guideService.getAllGuides()
        setGuides(data)
        
        // Extract unique expertise values from guides
        const allExpertise = data.flatMap(guide => {
          // Ensure expertise is an array before using it
          return Array.isArray(guide.expertise) ? guide.expertise : []
        })
        
        const uniqueExpertise = Array.from(new Set(allExpertise))
        // Capitalize first letter of each specialty
        const capitalizedExpertise = uniqueExpertise.map(exp => 
          typeof exp === 'string' ? exp.charAt(0).toUpperCase() + exp.slice(1) : exp
        )
        setSpecialties(["Toutes", ...capitalizedExpertise])
        
        // Extract unique covered governorates from guides
        const allGovernorates = data.flatMap(guide => 
          Array.isArray(guide.coveredGovernorates) ? guide.coveredGovernorates : []
        )
        const uniqueGovernorates = Array.from(new Set(allGovernorates))
        // Capitalize first letter of each location
        const capitalizedGovernorates = uniqueGovernorates.map(gov => 
          typeof gov === 'string' ? gov.charAt(0).toUpperCase() + gov.slice(1) : gov
        )
        setLocations(["Tous", ...capitalizedGovernorates])
        
        setError(null)
      } catch (err) {
        console.error("Error fetching guides:", err)
        setError("Impossible de charger les guides. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [])

  // Calculate rating stars (full, half, empty)
  const renderRatingStars = (rating = 0) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars = []

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 text-amber-400 fill-amber-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-amber-400" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
        </div>,
      )
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-amber-400" />)
    }

    return stars
  }

  // Filter guides based on selected filters
  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      // Filter by specialty - if "Toutes" is selected, match all guides
      // Otherwise, guide must match ALL selected specialties (intersection)
      const matchesSpecialty =
        selectedSpecialties.includes("Toutes") ||
        (guide.expertise &&
          Array.isArray(guide.expertise) &&
          selectedSpecialties.every(selected => {
            // Skip "Toutes" in the every check
            if (selected === "Toutes") return true;
            
            // Check if this specialty exists in guide's expertise (case-insensitive)
            return guide.expertise?.some((exp: string) => 
              selected.toLowerCase() === exp.toLowerCase() ||
              selected === (exp.charAt(0).toUpperCase() + exp.slice(1))
            ) || false;
          }))

      // Filter by location - if "Tous" is selected, match all guides
      // Otherwise, guide must match ALL selected locations (intersection)
      const matchesLocation =
        selectedLocations.includes("Tous") ||
        (guide.coveredGovernorates &&
          Array.isArray(guide.coveredGovernorates) &&
          selectedLocations.every(selected => {
            // Skip "Tous" in the every check
            if (selected === "Tous") return true;
            
            // Check if this location exists in guide's covered governorates (case-insensitive)
            return guide.coveredGovernorates?.some((loc: string) => 
              selected.toLowerCase() === loc.toLowerCase() ||
              selected === (loc.charAt(0).toUpperCase() + loc.slice(1))
            ) || false;
          }))

      // Filter by search term
      const matchesSearch =
        !searchTerm ||
        guide.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.bio?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSpecialty && matchesLocation && matchesSearch
    })
  }, [guides, selectedSpecialties, selectedLocations, searchTerm])

  // Sort guides based on selected sort option
  const sortedGuides = [...filteredGuides].sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0)
    if (sortBy === "experience") return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0)
    return 0
  })

  const visibleGuides = sortedGuides.slice(0, visibleCount)

  const loadMore = () => {
    setVisibleCount((prev) => prev + 4)
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedSpecialties(["Toutes"])
    setSelectedLocations(["Tous"])
    setSearchTerm("")
    setSortBy("rating")
  }

  // The handleContactGuide function is already defined above

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Floating tourism elements */}
      <div className="absolute top-16 right-8 opacity-10">
        <Compass className="h-28 w-28 text-blue-400" />
      </div>
      <div className="absolute bottom-16 left-8 opacity-10">
        <Palmtree className="h-24 w-24 text-teal-400" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 mr-3">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 via-teal-700 to-blue-700 bg-clip-text text-transparent tracking-tight">
              Nos Guides Experts
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg max-w-2xl mx-auto text-gray-600"
          >
            Découvrez nos guides passionnés qui vous feront vivre une expérience authentique de la Tunisie
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 flex flex-col md:flex-row gap-4 sticky top-4 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-gray-200 shadow-lg"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
            <Input
              type="text"
              placeholder="Rechercher un guide..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus-visible:ring-blue-500 rounded-full"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {/* Location filter */}
            <div>
              <Label htmlFor="location" className="sr-only">Lieu</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 whitespace-nowrap border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-full px-6"
                  >
                    <MapPin className="w-4 h-4" />
                    Lieu: {selectedLocations.includes("Tous") ? "Tous" : 
                          selectedLocations.length > 1 ? 
                          `${selectedLocations.length} sélectionnés` : 
                          selectedLocations[0]}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl border-blue-100">
                  {locations.map((location) => (
                    <div
                      key={location}
                      className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-blue-50 ${selectedLocations.includes(location) ? "bg-amber-100 font-medium" : ""}`}
                      onClick={() => {
                        if (location === "Tous") {
                          setSelectedLocations(["Tous"])
                        } else {
                          const newLocations = selectedLocations.filter(loc => loc !== "Tous")
                          if (selectedLocations.includes(location)) {
                            // Remove this location
                            const filtered = newLocations.filter(loc => loc !== location)
                            setSelectedLocations(filtered.length === 0 ? ["Tous"] : filtered)
                          } else {
                            // Add this location
                            setSelectedLocations([...newLocations, location])
                          }
                        }
                      }}
                    >
                      {location}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Specialty filter */}
            <div>
              <Label htmlFor="specialty" className="sr-only">Spécialité</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 whitespace-nowrap border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-full px-6"
                  >
                    <Award className="w-4 h-4" />
                    Spécialité: {selectedSpecialties.includes("Toutes") ? "Toutes" : 
                               selectedSpecialties.length > 1 ? 
                               `${selectedSpecialties.length} sélectionnées` : 
                               selectedSpecialties[0]}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl border-blue-100">
                  {specialties.map((specialty) => (
                    <div
                      key={specialty}
                      className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-blue-50 ${selectedSpecialties.includes(specialty) ? "bg-amber-100 font-medium" : ""}`}
                      onClick={() => {
                        if (specialty === "Toutes") {
                          setSelectedSpecialties(["Toutes"])
                        } else {
                          const newSpecialties = selectedSpecialties.filter(spec => spec !== "Toutes")
                          if (selectedSpecialties.includes(specialty)) {
                            // Remove this specialty
                            const filtered = newSpecialties.filter(spec => spec !== specialty)
                            setSelectedSpecialties(filtered.length === 0 ? ["Toutes"] : filtered)
                          } else {
                            // Add this specialty
                            setSelectedSpecialties([...newSpecialties, specialty])
                          }
                        }
                      }}
                    >
                      {specialty}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Sort dropdown */}
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 whitespace-nowrap border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full px-6"
                  >
                    Trier par
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-blue-100">
                  {sortOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-blue-50 rounded-lg ${sortBy === option.value ? "bg-amber-100 text-blue-800 font-medium" : ""}`}
                    >
                      {option.label}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-gray-600">{error}</p>
          </div>
        ) : filteredGuides.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 flex items-center justify-center">
              <Search className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun guide trouvé</h3>
            <p className="text-gray-600 max-w-md mb-6">
              Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
            </p>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full px-6"
            >
              Réinitialiser les filtres
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {visibleGuides.map((guide, index) => (
                <motion.div
                  key={guide._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                  }}
                >
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white rounded-lg group max-w-xs mx-auto min-h-[360px] flex flex-col">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-3 flex flex-col items-center group-hover:from-gray-100 group-hover:to-gray-200 transition-all duration-300">
                        <Avatar className="h-14 w-14 border-2 border-white shadow-md mb-2">
                          <AvatarImage src={guide.profileImage || guide.avatar || "/placeholder.svg"} alt={guide.name} />
                          <AvatarFallback className="text-2xl bg-amber-200 text-blue-800">
                            {guide.name?.charAt(0) || "G"}
                          </AvatarFallback>
                        </Avatar>

                        {/* Removed 'Disponible' badge as requested */}

                        <h3 className="text-base font-bold text-gray-900 mb-1">{guide.name}</h3>
                        
                        {/* Display all expertise as badges */}
                        <div className="flex flex-wrap justify-center gap-1 mb-1">
                          {guide.expertise && Array.isArray(guide.expertise) && guide.expertise.map((exp: string, index: number) => (
                            <Badge
                              key={`${exp}-${index}`}
                              variant="outline"
                              className="bg-blue-50 border-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded-full font-normal"
                            >
                              {typeof exp === 'string' ? exp.charAt(0).toUpperCase() + exp.slice(1) : exp}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center mb-2">
                          <div className="flex mr-2">{renderRatingStars(guide.rating ?? guide.stats?.averageRating ?? 0)}</div>
                          <span className="text-gray-800 font-medium">
                            {(guide.rating ?? guide.stats?.averageRating ?? 0).toFixed(1)}
                            <span className="text-gray-500 ml-1 font-normal">({guide.reviewCount || 0})</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-3 flex flex-col flex-1">
                        <p className="text-gray-600 text-xs italic mb-2 text-center">"{guide.bio || guide.description || "Guide professionnel en Tunisie"}"</p>

                        <div className="flex items-center justify-center text-gray-700 text-sm mt-2 mb-2">
                            <Award className="w-4 h-4 mr-2 text-blue-500" />
                            <span>{guide.yearsOfExperience ? `${guide.yearsOfExperience} ans` : "Professionnel"}</span>
                        </div>
                      </div>  
                    

                      <div className="px-3 mt-auto">
                        <div className="flex items-center justify-center mb-2">
<Languages className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="text-gray-700 font-medium text-xs">Langues parlées</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1 mb-2">
                          {(guide.languages || ["Français"]).map((language: string) => (
                            <Badge
                              key={language}
                              variant="outline"
                              className="bg-white border-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-normal"
                            >
                              {typeof language === 'string' ? language.charAt(0).toUpperCase() + language.slice(1) : language}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Covered Governorates - Centered under languages */}
                        <div className="flex flex-col items-center text-center mb-2">
                          <div className="flex items-center justify-center mb-2">
                            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="text-gray-700 font-medium text-xs">Gouvernorats couverts</span>
                          </div>
                          <span className="text-gray-700 text-xs font-normal">
                            {guide.coveredGovernorates && guide.coveredGovernorates.length > 0
                              ? guide.coveredGovernorates.map((gov: string) => 
                                  typeof gov === 'string' ? gov.charAt(0).toUpperCase() + gov.slice(1) : gov
                                ).join(", ")
                              : "Toute la Tunisie"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 px-3 pb-3">
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs py-1.5"
                          onClick={() => handleContactGuide(guide)}
                        >
                          Contacter
                          <Mail className="ml-2 h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline"
                          asChild
                          className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-xs py-1.5"
                        >
                          <Link href={`/Profile/${guide._id}`}>
                            Voir le profil
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {visibleCount < filteredGuides.length && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={loadMore}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Afficher plus de guides
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
