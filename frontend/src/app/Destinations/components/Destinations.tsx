"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Search, ArrowRight, Filter, ChevronDown } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-center mb-4">Découvrez la Tunisie</h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base max-w-2xl mx-auto text-center text-zinc-600 dark:text-zinc-400"
          >
            Explorez les plus beaux endroits de la Tunisie, des plages paradisiaques aux sites historiques fascinants.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8 flex flex-col md:flex-row gap-4 sticky top-4 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <Input
              type="text"
              placeholder="Rechercher une destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 whitespace-nowrap border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <Filter className="w-4 h-4" />
                Trier par
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={sortBy === option.value ? "bg-zinc-100 dark:bg-zinc-800" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        <Tabs defaultValue="Toutes" className="mb-12" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="mx-auto flex justify-center bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-sm p-1 rounded-full">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="rounded-full data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm"
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
                <div className="w-16 h-16 mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Search className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  Aucune destination trouvée
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
                  Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-4 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
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
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
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
      className="group relative overflow-hidden rounded-xl shadow-md h-[350px] transition-all duration-300 hover:shadow-lg"
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
        <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full w-fit text-white text-xs">
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

            <Button asChild size="sm" className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-2">
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
