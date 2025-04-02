"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const activities = [
  {
    name: "Camping à Ain Drahem",
    description: "Découvrez la beauté naturelle des forêts tunisiennes",
    price: "120",
    image: "/images/Aindrahem_pic.png",
    featured: true,
    rating: 4.8,
    reviews: 124,
  },
  {
    name: "Excursion dans le désert",
    description: "Aventure inoubliable dans le Sahara",
    price: "200",
    image: "/images/Excursion desert.jpg",
    rating: 4.7,
    reviews: 98,
  },
  {
    name: "Tour gastronomique",
    description: "Découverte des saveurs tunisiennes",
    price: "85",
    image: "/images/Gastronomie.jpg",
    featured: true,
    rating: 4.9,
    reviews: 156,
  },
  {
    name: "Plongée à Tabarka",
    description: "Explorez les fonds marins méditerranéens",
    price: "150",
    image: "/images/the-needles-1075628_640.jpg",
    rating: 4.6,
    reviews: 87,
  },
]

interface ActivityCardProps {
  activity: {
    name: string
    description: string
    price: string
    image: string
    featured?: boolean
    rating: number
    reviews: number
  }
}

function ActivityCard({ activity }: ActivityCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="overflow-hidden h-full border-0 shadow-lg transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={activity.image || "/placeholder.svg"}
          alt={activity.name}
          fill
          style={{ objectFit: "cover" }}
          className={`transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
        />
        {activity.featured && <Badge className="absolute top-2 right-2 bg-blue-600">Populaire</Badge>}
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">{activity.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{activity.description}</p>
        <div className="flex items-center mb-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {activity.rating}
            <span className="text-gray-500 dark:text-gray-400 ml-1">({activity.reviews} avis)</span>
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="text-lg font-bold text-gray-900 dark:text-white">{activity.price} DT</span>
        <Button className="bg-blue-600 hover:bg-blue-700">Réserver</Button>
      </CardFooter>
    </Card>
  )
}

export default function PopularActivities() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Activités Populaires</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Découvrez les meilleures expériences à vivre lors de votre séjour en Tunisie
          </p>
        </motion.div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {activities.map((activity, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ActivityCard activity={activity} />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:flex justify-center mt-8 gap-2">
            <CarouselPrevious className="relative inset-0 translate-y-0 bg-blue-600 hover:bg-blue-700 text-white" />
            <CarouselNext className="relative inset-0 translate-y-0 bg-blue-600 hover:bg-blue-700 text-white" />
          </div>
        </Carousel>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mt-10"
        >
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
            <Link href="/Activities">
              Voir toutes les activités
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
