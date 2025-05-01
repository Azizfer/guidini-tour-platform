"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, Star, Calendar, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Combine all activities from all destinations
const allActivities = [
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
    dates: ["2024-04-01", "2024-04-03", "2024-04-05"],
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
    image: "/placeholder.svg?height=600&width=800&text=Excursion+Sahara",
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
  {
    id: 401,
    title: "Plongée sous-marine à Tabarka",
    image: "/placeholder.svg?height=600&width=800&text=Plongée+Tabarka",
    description: "Explorez les fonds marins méditerranéens",
    longDescription:
      "Découvrez la richesse des fonds marins de la Méditerranée lors d'une session de plongée encadrée par des professionnels. Idéal pour les débutants comme pour les plongeurs expérimentés.",
    duration: "4 heures",
    price: 80,
    rating: 4.6,
    reviewCount: 52,
    maxParticipants: 8,
    dates: ["2024-04-05", "2024-04-12", "2024-04-19"],
    category: "Sport",
    location: "Tabarka",
  },
  {
    id: 501,
    title: "Atelier de cuisine tunisienne",
    image: "/placeholder.svg?height=600&width=800&text=Cuisine+Tunisienne",
    description: "Apprenez à préparer des plats traditionnels",
    longDescription:
      "Participez à un atelier de cuisine authentique et apprenez à préparer des plats traditionnels tunisiens comme le couscous, le tajine ou les pâtisseries orientales.",
    duration: "3 heures",
    price: 65,
    rating: 4.9,
    reviewCount: 38,
    maxParticipants: 10,
    dates: ["2024-04-07", "2024-04-14", "2024-04-21"],
    category: "Gastronomie",
    location: "Tunis",
  },
  {
    id: 601,
    title: "Visite de la médina de Kairouan",
    image: "/placeholder.svg?height=600&width=800&text=Médina+Kairouan",
    description: "Découverte de la ville sainte",
    longDescription:
      "Explorez la médina de Kairouan, quatrième ville sainte de l'Islam, avec ses souks animés, sa Grande Mosquée et ses ateliers d'artisanat traditionnel.",
    duration: "4 heures",
    price: 40,
    rating: 4.7,
    reviewCount: 65,
    maxParticipants: 15,
    dates: ["2024-04-08", "2024-04-15", "2024-04-22"],
    category: "Histoire",
    location: "Kairouan",
  },
]

export default function AllActivities() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrer les activités en fonction de la recherche
  const filteredActivities = allActivities.filter(
    (activity) =>
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mx-auto flex justify-center">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="Histoire">Histoire</TabsTrigger>
            <TabsTrigger value="Culture">Culture</TabsTrigger>
            <TabsTrigger value="Aventure">Aventure</TabsTrigger>
            <TabsTrigger value="Sport">Sport</TabsTrigger>
            <TabsTrigger value="Gastronomie">Gastronomie</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
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

          {["Histoire", "Culture", "Aventure", "Sport", "Gastronomie"].map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredActivities
                  .filter((act) => act.category === category)
                  .map((activity, index) => (
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
          ))}
        </Tabs>
      </div>
    </div>
  )
}

interface ActivityCardProps {
  activity: {
    id: number
    title: string
    image: string
    description: string
    longDescription: string
    duration: string
    price: number
    rating: number
    reviewCount: number
    maxParticipants: number
    dates: string[]
    category: string
    location: string
  }
  index: number
  hoveredId: number | null
  setHoveredId: (id: number | null) => void
}

function ActivityCard({ activity, index, hoveredId, setHoveredId }: ActivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden h-[400px] border-0 shadow-lg">
        <div
          className="relative h-full cursor-pointer"
          onMouseEnter={() => setHoveredId(activity.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <Image
            src={activity.image || "/placeholder.svg"}
            alt={activity.title}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay qui apparaît au survol */}
          <div
            className={`absolute inset-0 bg-black/70 flex flex-col justify-center p-6 transition-opacity duration-300 ${
              hoveredId === activity.id ? "opacity-100" : "opacity-0"
            }`}
          >
            <CardHeader className="p-0 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-white">{activity.title}</CardTitle>
                <Badge className="bg-teal-500/80">{activity.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-4 mt-2">
              <p className="text-white/90">{activity.longDescription}</p>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center text-white/80">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{activity.duration}</span>
                </div>
                <div className="flex items-center text-white/80">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Max {activity.maxParticipants} personnes</span>
                </div>
                <div className="flex items-center text-white/80">
                  <Star className="h-4 w-4 mr-2" />
                  <span>
                    {activity.rating} ({activity.reviewCount} avis)
                  </span>
                </div>
                <div className="flex items-center text-white/80">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{activity.dates.length} dates disponibles</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-0 pt-4 flex items-center justify-between">
              <div className="text-2xl font-bold text-white">{activity.price}€</div>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">Réserver</Button>
            </CardFooter>
          </div>

          {/* Légende toujours visible quand pas de survol */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
              hoveredId === activity.id ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">{activity.title}</h3>
              <Badge className="bg-teal-500/80">{activity.category}</Badge>
            </div>
            <p className="text-sm text-white/90">{activity.description}</p>
            <div className="flex items-center mt-1 text-white/80 text-sm">
              <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
              <span>
                {activity.rating} ({activity.reviewCount} avis)
              </span>
              <span className="mx-2">•</span>
              <span>{activity.price}€</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
