"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Search, ArrowRight, Filter, ChevronDown, Compass, Palmtree, Waves } from "lucide-react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Footer from "@/components/footer"

const allDestinations = [
  {
    id: 1,
    name: "Carthage",
    image: "/placeholder.svg?height=600&width=800&text=Carthage",
    description: "Site historique UNESCO",
    longDescription:
      "Ancienne cité phénicienne, Carthage est un site archéologique majeur avec des ruines romaines impressionnantes.",
    location: "Tunis",
    bestTime: "Mars à Juin, Septembre à Novembre",
    category: "historique",
  },
  {
    id: 2,
    name: "Sidi Bou Said",
    image: "/placeholder.svg?height=600&width=800&text=Sidi+Bou+Said",
    description: "Village pittoresque méditerranéen",
    longDescription:
      "Village aux maisons blanches et bleues perché sur une falaise surplombant la Méditerranée, inspirant de nombreux artistes.",
    location: "Tunis",
    bestTime: "Avril à Octobre",
    category: "culturel",
  },
  {
    id: 3,
    name: "Djerba",
    image: "/placeholder.svg?height=600&width=800&text=Djerba",
    description: "Île aux mille couleurs",
    longDescription:
      "Île paradisiaque avec des plages de sable fin, une architecture traditionnelle et un riche patrimoine culturel.",
    location: "Sud-Est de la Tunisie",
    bestTime: "Mai à Octobre",
    category: "plage",
  },
  {
    id: 4,
    name: "Kairouan",
    image: "/placeholder.svg?height=600&width=800&text=Kairouan",
    description: "Ville sainte de l'Islam",
    longDescription:
      "Quatrième ville sainte de l'Islam, connue pour sa Grande Mosquée et son architecture islamique préservée.",
    location: "Centre de la Tunisie",
    bestTime: "Mars à Mai, Septembre à Novembre",
    category: "religieux",
  },
  {
    id: 5,
    name: "Matmata",
    image: "/placeholder.svg?height=600&width=800&text=Matmata",
    description: "Habitations troglodytiques",
    longDescription:
      "Village berbère célèbre pour ses habitations souterraines et ses paysages lunaires, lieu de tournage de Star Wars.",
    location: "Sud de la Tunisie",
    bestTime: "Octobre à Avril",
    category: "culturel",
  },
  {
    id: 6,
    name: "Hammamet",
    image: "/placeholder.svg?height=600&width=800&text=Hammamet",
    description: "Station balnéaire populaire",
    longDescription:
      "Station balnéaire réputée pour ses plages de sable fin, sa médina historique et ses jardins luxuriants.",
    location: "Cap Bon",
    bestTime: "Juin à Septembre",
    category: "plage",
  },
]

const categories = ["Toutes", "historique", "culturel", "plage", "religieux"]

const sortOptions = [
  { label: "Nom (A-Z)", value: "name-asc" },
  { label: "Nom (Z-A)", value: "name-desc" },
  { label: "Lieu", value: "location" },
]

export default function DestinationsPage() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Toutes")
  const [visibleCount, setVisibleCount] = useState(6)
  const [sortBy, setSortBy] = useState("name-asc")

  // Filtrer les destinations en fonction des critères
  const filteredDestinations = allDestinations.filter((destination) => {
    const matchesSearch =
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "Toutes" || destination.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Trier les destinations
  const sortedDestinations = [...filteredDestinations].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name)
      case "name-desc":
        return b.name.localeCompare(a.name)
      case "location":
        return a.location.localeCompare(b.location)
      default:
        return 0
    }
  })

  const visibleDestinations = sortedDestinations.slice(0, visibleCount)

  const loadMore = () => {
    setVisibleCount((prev) => prev + 3)
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory("Toutes")
    setSearchTerm("")
    setSortBy("name-asc")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-amber-50 relative overflow-hidden">
      {/* Floating tourism elements */}
      <div className="absolute top-20 right-12 opacity-10">
        <Waves className="h-32 w-32 text-blue-400" />
      </div>
      <div className="absolute bottom-20 left-12 opacity-10">
        <Palmtree className="h-28 w-28 text-teal-400" />
      </div>
      <div className="absolute top-1/2 left-8 opacity-10">
        <Compass className="h-24 w-24 text-amber-400" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="p-3 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 mr-3">
              <MapPin className="h-8 w-8 text-teal-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-700 via-blue-700 to-amber-700 bg-clip-text text-transparent">
              Découvrez la Tunisie
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base max-w-2xl mx-auto text-center text-gray-600"
          >
            Explorez les plus beaux endroits de la Tunisie, des plages paradisiaques aux sites historiques fascinants.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8 flex flex-col md:flex-row gap-4 sticky top-4 z-10 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-teal-100 shadow-lg"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500" />
            <Input
              type="text"
              placeholder="Rechercher une destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-teal-200 focus-visible:ring-teal-500 rounded-full"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap border-blue-300 text-blue-600 hover:bg-blue-50 rounded-full px-6"
              >
                <Filter className="w-4 h-4" />
                Trier par
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-blue-100">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`rounded-lg ${sortBy === option.value ? "bg-blue-50 text-blue-700 font-medium" : ""}`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        <Tabs defaultValue="Toutes" className="mb-12" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="mx-auto flex justify-center bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-md border border-teal-100">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
              >
                {category === "historique"
                  ? "Historique"
                  : category === "culturel"
                    ? "Culturel"
                    : category === "plage"
                      ? "Plages"
                      : category === "religieux"
                        ? "Religieux"
                        : category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-12">
            {filteredDestinations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-teal-100 to-blue-100 flex items-center justify-center">
                  <Search className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune destination trouvée</h3>
                <p className="text-gray-600 max-w-md mb-6">
                  Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="border-teal-300 text-teal-600 hover:bg-teal-50 rounded-full px-6"
                >
                  Réinitialiser les filtres
                </Button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleDestinations.map((destination, index) => (
                    <motion.div
                      key={destination.id}
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
                      <DestinationCard
                        destination={destination}
                        index={index}
                        hoveredId={hoveredId}
                        setHoveredId={setHoveredId}
                      />
                    </motion.div>
                  ))}
                </div>

                {visibleCount < filteredDestinations.length && (
                  <div className="flex justify-center mt-12">
                    <Button
                      onClick={loadMore}
                      className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Afficher plus de destinations
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}

interface DestinationCardProps {
  destination: {
    id: number
    name: string
    image: string
    description: string
    longDescription: string
    location: string
    bestTime: string
    category: string
  }
  index: number
  hoveredId: number | null
  setHoveredId: (id: number | null) => void
}

function DestinationCard({ destination, index, hoveredId, setHoveredId }: DestinationCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl shadow-lg h-[350px] transition-all duration-300 hover:shadow-xl border border-white/20"
      onMouseEnter={() => setHoveredId(destination.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80 z-10" />

      <Image
        src={destination.image || "/placeholder.svg"}
        alt={destination.name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between">
        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full w-fit text-white text-xs border border-white/30">
          {destination.category === "historique"
            ? "Historique"
            : destination.category === "culturel"
              ? "Culturel"
              : destination.category === "plage"
                ? "Plage"
                : destination.category === "religieux"
                  ? "Religieux"
                  : destination.category}
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">{destination.name}</h3>
          <p className="text-white/90 text-sm line-clamp-2">{destination.description}</p>

          <div
            className={`space-y-3 transition-all duration-300 ${hoveredId === destination.id ? "opacity-100 max-h-[200px]" : "opacity-0 max-h-0 overflow-hidden"}`}
          >
            <p className="text-white/80 text-sm line-clamp-3">{destination.longDescription}</p>

            <div className="flex items-center text-white/80 text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{destination.location}</span>
            </div>

            <div className="flex items-center text-white/80 text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Meilleure période: {destination.bestTime}</span>
            </div>

            <Button
              asChild
              size="sm"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white mt-2 rounded-full border-none"
            >
              <Link href={`/activities/${destination.id}`}>
                Voir les activités
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
