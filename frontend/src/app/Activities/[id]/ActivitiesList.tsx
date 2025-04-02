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

interface Activity {
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

type ActivitiesData = {
  [key: number]: Activity[]
}

// Activities data by destination ID
const activitiesByDestination: ActivitiesData = {
  1: [
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
    // Add more activities for Carthage
  ],
  2: [
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
    // Add more activities for Sidi Bou Said
  ],
  // Add more destinations
}

interface ActivityCardProps {
  activity: Activity
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
          <Badge className="absolute top-2 right-2" variant="secondary">
            {activity.category}
          </Badge>
        </div>
        <CardHeader>
          <CardTitle className="text-xl">{activity.title}</CardTitle>
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

export default function ActivitiesList() {
  const params = useParams()
  const destinationId = Number(params.id)
  const activities = activitiesByDestination[destinationId] || []

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" asChild>
          <Link href="/Destinations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux destinations
          </Link>
        </Button>
      </div>

      <h1 className="text-4xl font-bold mb-8">Activités disponibles</h1>
      
      {activities.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Aucune activité disponible pour cette destination.
          </p>
        </div>
      )}
    </div>
  )
}
