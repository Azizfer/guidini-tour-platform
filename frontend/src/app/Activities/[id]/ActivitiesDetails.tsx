"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, Star, Calendar } from "lucide-react"

// Données des destinations
const destinations = [
  {
    id: 1,
    name: "Carthage",
    image: "/images/Photo de carthage.jpg",
    description: "Site historique UNESCO",
  },
  {
    id: 2,
    name: "Sidi Bou Said",
    image: "/images/Photo de sidi bou said.jpg",
    description: "Village pittoresque méditerranéen",
  },
  {
    id: 3,
    name: "Djerba",
    image: "/images/Photo de djerba.jpg",
    description: "Île aux mille couleurs",
  },
  {
    id: 4,
    name: "Kairouan",
    image: "/placeholder.svg?height=600&width=800",
    description: "Ville sainte de l'Islam",
  },
  {
    id: 5,
    name: "Matmata",
    image: "/placeholder.svg?height=600&width=800",
    description: "Habitations troglodytiques",
  },
  {
    id: 6,
    name: "Hammamet",
    image: "/placeholder.svg?height=600&width=800",
    description: "Station balnéaire populaire",
  },
]

const activitiesByDestination = {
  1: [
    {
      id: 101,
      title: "Visite guidée des ruines de Carthage",
      image: "/placeholder.svg?height=400&width=600",
      description: "Explorez les vestiges de l'ancienne cité phénicienne avec un guide expert en histoire.",
      duration: "3 heures",
      price: 45,
      rating: 4.8,
      reviewCount: 124,
      maxParticipants: 15,
      dates: ["Lundi", "Mercredi", "Vendredi", "Samedi"],
      category: "Historique",
    },
    {
      id: 102,
      title: "Musée de Carthage et ses trésors",
      image: "/placeholder.svg?height=400&width=600",
      description: "Découvrez les artefacts précieux et l'histoire fascinante de Carthage au musée national.",
      duration: "2 heures",
      price: 30,
      rating: 4.6,
      reviewCount: 98,
      maxParticipants: 20,
      dates: ["Mardi", "Jeudi", "Samedi", "Dimanche"],
      category: "Culturel",
    },
    {
      id: 103,
      title: "Coucher de soleil aux thermes d'Antonin",
      image: "/placeholder.svg?height=400&width=600",
      description: "Admirez le coucher de soleil spectaculaire depuis les thermes romains d'Antonin.",
      duration: "1.5 heures",
      price: 25,
      rating: 4.9,
      reviewCount: 76,
      maxParticipants: 10,
      dates: ["Tous les jours"],
      category: "Paysage",
    },
  ],
  2: [
    {
      id: 201,
      title: "Promenade dans les ruelles de Sidi Bou Said",
      image: "/placeholder.svg?height=400&width=600",
      description: "Flânez dans les charmantes ruelles bleues et blanches de ce village pittoresque.",
      duration: "2 heures",
      price: 35,
      rating: 4.7,
      reviewCount: 156,
      maxParticipants: 12,
      dates: ["Tous les jours"],
      category: "Culturel",
    },
    {
      id: 202,
      title: "Atelier de peinture inspiré par Sidi Bou Said",
      image: "/placeholder.svg?height=400&width=600",
      description: "Créez votre propre œuvre d'art inspirée par les couleurs et l'ambiance du village.",
      duration: "3 heures",
      price: 50,
      rating: 4.8,
      reviewCount: 42,
      maxParticipants: 8,
      dates: ["Mardi", "Jeudi", "Samedi"],
      category: "Artistique",
    },
  ],
  3: [
    {
      id: 301,
      title: "Excursion en bateau autour de Djerba",
      image: "/images/Photo de djerba.jpg",
      description: "Naviguez autour de l'île et découvrez ses criques cachées et ses plages paradisiaques.",
      duration: "4 heures",
      price: 65,
      rating: 4.9,
      reviewCount: 87,
      maxParticipants: 20,
      dates: ["Lundi", "Mercredi", "Vendredi", "Dimanche"],
      category: "Nautique",
    },
  ],
  4: [
    {
      id: 401,
      title: "Visite de la Grande Mosquée de Kairouan",
      image: "/images/Photo de kairouan",
      description: "Découvrez l'un des monuments les plus importants de l'Islam en Afrique du Nord.",
      duration: "2 heures",
      price: 40,
      rating: 4.7,
      reviewCount: 112,
      maxParticipants: 15,
      dates: ["Tous les jours sauf vendredi"],
      category: "Religieux",
    },
  ],
  5: [
    {
      id: 501,
      title: "Exploration des maisons troglodytiques",
      image: "/placeholder.svg?height=400&width=600",
      description: "Visitez les habitations souterraines traditionnelles berbères.",
      duration: "3 heures",
      price: 45,
      rating: 4.6,
      reviewCount: 93,
      maxParticipants: 12,
      dates: ["Mardi", "Jeudi", "Samedi", "Dimanche"],
      category: "Culturel",
    },
  ],
  6: [
    {
      id: 601,
      title: "Journée détente sur les plages d'Hammamet",
      image: "/images/Photo de hammamet",
      description: "Profitez d'une journée de détente sur les magnifiques plages de sable fin d'Hammamet.",
      duration: "Journée complète",
      price: 55,
      rating: 4.8,
      reviewCount: 145,
      maxParticipants: 25,
      dates: ["Tous les jours"],
      category: "Plage",
    },
  ],
}

export default function ActivitiesPage() {
  const params = useParams()
  const destinationId = Number(params.id)

  // Trouver la destination correspondante
  const destination = destinations.find((d) => d.id === destinationId)

  // Récupérer les activités pour cette destination
  const activities = activitiesByDestination[destinationId as keyof typeof activitiesByDestination] || []

  // État pour le filtrage des activités
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Obtenir toutes les catégories uniques
  const categories: string[] = Array.from(new Set(activities.map((activity) => activity.category)))

  // Filtrer les activités par catégorie
  const filteredActivities = selectedCategory
    ? activities.filter((activity) => activity.category === selectedCategory)
    : activities

  if (!destination) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Destination non trouvée</h1>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/destinationsDetailsPage">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux destinations
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button asChild variant="outline" className="hover:text-green-700 dark:hover:text-green-500">
            <Link href="/destinationsDetailsPage">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux destinations
            </Link>
          </Button>
        </div>

        <div className="relative h-[300px] mb-8 rounded-xl overflow-hidden shadow-lg">
          <Image
            src={destination.image || "/placeholder.svg"}
            alt={destination.name}
            fill
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-2"
            >
              {destination.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-white/90"
            >
              {destination.description}
            </motion.p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Activités à {destination.name}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Découvrez les meilleures expériences et activités à faire lors de votre visite à {destination.name}.
            Réservez à l'avance pour garantir votre place !
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={
                selectedCategory === null
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "hover:text-green-700 dark:hover:text-green-500"
              }
            >
              Toutes
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "hover:text-green-700 dark:hover:text-green-500"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredActivities.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} index={index} />
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-700 dark:text-gray-300">Aucune activité trouvée dans cette catégorie.</p>
          </div>
        )}
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
    duration: string
    price: number
    rating: number
    reviewCount: number
    maxParticipants: number
    dates: string[]
    category: string
  }
  index: number
}

function ActivityCard({ activity, index }: ActivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-0 shadow-lg">
        <div className="relative h-48">
          <Image src={activity.image || "/placeholder.svg"} alt={activity.title} fill style={{ objectFit: "cover" }} />
          <Badge className="absolute top-2 right-2 bg-orange-500">{activity.category}</Badge>
        </div>

        <CardHeader>
          <CardTitle>{activity.title}</CardTitle>
          <CardDescription className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span>
              {activity.rating} ({activity.reviewCount} avis)
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <p className="text-gray-700 dark:text-gray-300 mb-4">{activity.description}</p>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-2" />
              <span>Durée: {activity.duration}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4 mr-2" />
              <span>Max {activity.maxParticipants} participants</span>
            </div>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Disponible: {activity.dates.join(", ")}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-4 flex justify-between items-center">
          <div className="text-lg font-bold">{activity.price} TND</div>
          <Button className="bg-blue-600 hover:bg-blue-700">Réserver</Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

