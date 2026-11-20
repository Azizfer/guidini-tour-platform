"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, Star, Calendar } from "lucide-react"
import { type Tour as Activity, getToursByLocation } from "@/services/toursService"

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
        {activity.image && (
          <div className="relative h-48">
            <Image
              alt={activity.title}
              className="object-cover"
              fill
              src={activity.image.startsWith("/") || activity.image.startsWith("http") ? activity.image : `/uploads/${activity.image}`}
            />
            {activity.category && (
              <Badge className="absolute top-2 right-2" variant="secondary">
                {Array.isArray(activity.category) ? activity.category[0] : activity.category}
              </Badge>
            )}
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-xl line-clamp-1">{activity.title}</CardTitle>
          <CardDescription className="line-clamp-2">{activity.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{activity.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Max {activity.maxParticipants} personnes</span>
            </div>
            {activity.rating !== undefined && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>
                  {activity.rating?.toFixed(1)} ({activity.reviewCount || 0} avis)
                </span>
              </div>
            )}
            {activity.date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{activity.date}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-2xl font-bold">{activity.price} TND</div>
          <Button asChild>
            <Link href={`/Activities?activityId=${activity._id || activity.id}`}>Réserver</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function ActivitiesList() {
  const params = useParams()
  const destinationId = params.id as string
  const [destinationName, setDestinationName] = useState<string>("")
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // 1. Fetch destination details to get its name
        const destRes = await fetch(`${API_BASE_URL}/api/destinations/${destinationId}`)
        if (!destRes.ok) {
          console.error("Destination not found")
          setLoading(false)
          return
        }
        const destData = await destRes.json()
        setDestinationName(destData.name)

        // 2. Fetch tours for this destination/location
        const tours = await getToursByLocation(destData.name)
        // Only show active/public tours
        setActivities(tours.filter((t: Activity) => t.tourStatus === "active"))
      } catch (err) {
        console.error("Erreur lors du chargement des activités:", err)
      } finally {
        setLoading(false)
      }
    }

    if (destinationId) {
      fetchData()
    }
  }, [destinationId])

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

      <h1 className="text-4xl font-bold mb-8">
        {destinationName ? `Activités à ${destinationName}` : "Activités disponibles"}
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Chargement des activités...</p>
      ) : activities.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, index) => (
            <ActivityCard key={activity._id || activity.id || index} activity={activity} index={index} />
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
