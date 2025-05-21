"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToursStore } from "@/services/toursService"
import ActivityCard from "./activity-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import PaymentStatusChecker from "./payment-status-checker"

// Données statiques pour les activités
const staticActivities = [
  {
    id: 101,
    title: "Visite guidée des ruines de Carthage",
    image: "/images/carthage-ruins.jpg",
    description: "Découvrez l'histoire fascinante de l'ancienne Carthage",
    longDescription:
      "Explorez les vestiges de l'ancienne cité punique et romaine avec un guide expert qui vous racontera l'histoire fascinante de ce site classé au patrimoine mondial de l'UNESCO.",
    duration: "3 heures",
    price: 45,
    maxParticipants: 15,
    dates: ["2024-04-05"],
    category: "Histoire",
    location: "Tunis",
  },
  {
    id: 201,
    title: "Balade dans les ruelles de Sidi Bou Said",
    image: "/images/sidi-bou-said.jpg",
    description: "Promenade dans le village blanc et bleu",
    longDescription:
      "Flânez dans les charmantes ruelles du village pittoresque de Sidi Bou Said, admirez l'architecture traditionnelle et profitez d'une vue imprenable sur la Méditerranée.",
    duration: "2 heures",
    price: 30,
    maxParticipants: 10,
    dates: ["2024-04-02", "2024-04-04", "2024-04-06"],
    category: "Culture",
    location: "Tunis",
  },
  {
    id: 301,
    title: "Excursion dans le désert du Sahara",
    image: "/images/sahara.jpg",
    description: "Aventure inoubliable dans les dunes",
    longDescription:
      "Partez à l'aventure dans le désert du Sahara, dormez sous les étoiles dans un campement traditionnel et profitez d'une balade à dos de chameau au coucher du soleil.",
    duration: "2 jours",
    price: 150,
    maxParticipants: 12,
    dates: ["2024-04-10", "2024-04-17", "2024-04-24"],
    category: "Aventure",
    location: "Sud Tunisien",
  },
]

const categories = ["Toutes", "Histoire", "Culture", "Aventure", "Sport", "Gastronomie", "Visite"]

const sortOptions = [
  { label: "Prix (croissant)", value: "price-asc" },
  { label: "Prix (décroissant)", value: "price-desc" },
  { label: "Durée (courte à longue)", value: "duration-asc" },
  { label: "Durée (longue à courte)", value: "duration-desc" },
]

export default function AllActivities() {
  const { tours } = useToursStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Toutes")
  const [visibleCount, setVisibleCount] = useState(6)
  const [sortBy, setSortBy] = useState("price-asc")

  // Convertir les tours du store en format d'activités
  const tourActivities = tours
    .filter((tour) => tour.isPublic)
    .map((tour) => ({
      id: tour.id || `tour-${Math.random().toString(36).substring(2, 9)}`,
      title: tour.title,
      image: tour.image || "/placeholder.svg?height=200&width=300",
      description: tour.description,
      longDescription: tour.description,
      duration: tour.duration,
      price: tour.price,

      maxParticipants: tour.maxParticipants,
      dates: [tour.date],
      category: Array.isArray(tour.category) ? tour.category[0] : (tour.category || "Visite"),
      location: tour.location,
    }))

  // Combiner les activités statiques et les tours
  const allActivities = [...staticActivities, ...tourActivities]

  // Filtrer les activités en fonction des critères
  const filteredActivities = allActivities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "Toutes" || activity.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Sort activities
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "duration-asc":
        // Simple duration comparison (assuming format like "2 heures", "3 jours")
        return a.duration.localeCompare(b.duration)
      case "duration-desc":
        return b.duration.localeCompare(a.duration)
      default:
        return 0
    }
  })

  const visibleActivities = sortedActivities.slice(0, visibleCount)

  const loadMore = () => {
    setVisibleCount((prev) => prev + 6)
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory("Toutes")
    setSearchTerm("")
    setSortBy("price-asc")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Payment status checker to show success message when returning from payment */}
      <PaymentStatusChecker />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-center mb-4">Découvrez Nos Activités</h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base max-w-2xl mx-auto text-center text-zinc-600 dark:text-zinc-400"
          >
            Explorez les meilleures expériences à vivre lors de votre séjour en Tunisie, des visites culturelles aux
            aventures en plein air.
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
              placeholder="Rechercher une activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 whitespace-nowrap">
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
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-12">
            {filteredActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Search className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">Aucune activité trouvée</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
                  Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
                </p>
                <Button variant="outline" onClick={resetFilters} className="mt-4">
                  Réinitialiser les filtres
                </Button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
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
                      <ActivityCard activity={activity} index={index} />
                    </motion.div>
                  ))}
                </div>

                {visibleCount < filteredActivities.length && (
                  <div className="flex justify-center mt-12">
                    <Button
                      onClick={loadMore}
                      variant="outline"
                      className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Afficher plus d'activités
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
