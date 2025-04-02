"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star, Calendar } from "lucide-react"
import Image from "next/image"

// Combine all activities from all destinations
const allActivities = [
  {
    id: 101,
    title: "Visite guidée des ruines de Carthage",
    image: "/images/carthage-ruins.jpg",
    description: "Découvrez l'histoire fascinante de l'ancienne Carthage",
    duration: "3 heures",
    price: 45,
    rating: 4.8,
    reviewCount: 124,
    maxParticipants: 15,
    dates: ["2024-04-01", "2024-04-03", "2024-04-05"],
    category: "Histoire"
  },
  {
    id: 201,
    title: "Balade dans les ruelles de Sidi Bou Said",
    image: "/images/sidi-bou-said.jpg",
    description: "Promenade dans le village blanc et bleu",
    duration: "2 heures",
    price: 30,
    rating: 4.9,
    reviewCount: 89,
    maxParticipants: 10,
    dates: ["2024-04-02", "2024-04-04", "2024-04-06"],
    category: "Culture"
  },
  // Add more activities as needed
]

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
      <Card className="overflow-hidden">
        <div className="relative h-48">
          <Image
            alt={activity.title}
            className="object-cover"
            fill
            src={activity.image}
          />
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{activity.title}</CardTitle>
            <Badge variant="secondary">{activity.category}</Badge>
          </div>
          <CardDescription>{activity.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{activity.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Max {activity.maxParticipants} personnes</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="text-sm">
                {activity.rating} ({activity.reviewCount} avis)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{activity.dates.length} dates disponibles</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-2xl font-bold">{activity.price}€</div>
          <Button>Réserver</Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function AllActivities() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Toutes les Activités</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allActivities.map((activity, index) => (
          <ActivityCard key={activity.id} activity={activity} index={index} />
        ))}
      </div>
    </div>
  )
}
