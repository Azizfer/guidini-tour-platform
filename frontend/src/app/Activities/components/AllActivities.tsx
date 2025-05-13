"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToursStore } from "@/services/toursService"
import ActivityCard from "@/app/Reservation/components/activity-card"

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
    rating: 4.8,
    reviewCount: 124,
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
    rating: 4.9,
    reviewCount: 89,
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
    rating: 4.7,
    reviewCount: 76,
    maxParticipants: 12,
    dates: ["2024-04-10", "2024-04-17", "2024-04-24"],
    category: "Aventure",
    location: "Sud Tunisien",
  },
]

export default function AllActivities() {
  const { tours } = useToursStore()
  const [hoveredId, setHoveredId] = useState<number | string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Convertir les tours du store en format d'activités
  const tourActivities = tours
    .filter((tour) => tour.isPublic)
    .map((tour) => ({
      id: tour.id,
      title: tour.title,
      image: tour.image || "/placeholder.svg?height=200&width=300",
      description: tour.description,
      longDescription: tour.description,
      duration: tour.duration,
      price: tour.price,
      rating: tour.rating || 4.5,
      reviewCount: tour.reviewCount || 0,
      maxParticipants: tour.maxParticipants,
      dates: [tour.date],
      category: tour.category || "Visite",
      location: tour.location,
    }))

  // Combiner les activités statiques et les tours
  const allActivities = [...staticActivities, ...tourActivities]

  // Filtrer les activités en fonction de la recherche et de la catégorie
  const filteredActivities = allActivities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || activity.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Toutes les Activités</h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-700">
            Explorez les meilleures expériences à vivre lors de votre séjour en Tunisie, des visites culturelles aux
            aventures en plein air.
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8" value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="mx-auto flex justify-center">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="Histoire">Histoire</TabsTrigger>
            <TabsTrigger value="Culture">Culture</TabsTrigger>
            <TabsTrigger value="Aventure">Aventure</TabsTrigger>
            <TabsTrigger value="Sport">Sport</TabsTrigger>
            <TabsTrigger value="Gastronomie">Gastronomie</TabsTrigger>
            <TabsTrigger value="Visite">Visites</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredActivities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  index={index}
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
