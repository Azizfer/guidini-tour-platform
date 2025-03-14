"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Search, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"

const allDestinations = [
  {
    id: 1,
    name: "Carthage",
    image: "/images/Photo de carthage.jpg",
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
    image: "/images/Photo de sidi bou said.jpg",
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
    image: "/images/Photo de djerba.jpg",
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
    image: "/images/Photo_kairouan.jpg",
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
    image: "/images/Photo_matmata.jpg",
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
    image: "/images/Photo_hammamet.jpg",
    description: "Station balnéaire populaire",
    longDescription:
      "Station balnéaire réputée pour ses plages de sable fin, sa médina historique et ses jardins luxuriants.",
    location: "Cap Bon",
    bestTime: "Juin à Septembre",
    category: "plage",
  },
]

export default function DestinationsDetailsPage() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Filtres des destinations (comparison entre recherche et desc/nom/location )
  const filteredDestinations = allDestinations.filter(
    (destination) =>
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Découvrez la Tunisie</h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
            Explorez les plus beaux endroits de la Tunisie, des plages paradisiaques aux sites historiques fascinants.
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mx-auto flex justify-center">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="historique">Historique</TabsTrigger>
            <TabsTrigger value="culturel">Culturel</TabsTrigger>
            <TabsTrigger value="plage">Plages</TabsTrigger>
            <TabsTrigger value="religieux">Religieux</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((destination, index) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  index={index}
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                />
              ))}
            </div>
          </TabsContent>

          {["historique", "culturel", "plage", "religieux"].map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDestinations
                  .filter((dest) => dest.category === category)
                  .map((destination, index) => (
                    <DestinationCard
                      key={destination.id}
                      destination={destination}
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

interface DestinationCardProps {
  destination: {
    id: number
    name: string
    image: string
    description: string
    longDescription: string
    location: string
    bestTime: string
  }
  index: number
  hoveredId: number | null
  setHoveredId: (id: number | null) => void
}

function DestinationCard({ destination, index, hoveredId, setHoveredId }: DestinationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden h-[400px] border-0 shadow-lg">
        <div
          className="relative h-full cursor-pointer"
          onMouseEnter={() => setHoveredId(destination.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <Image
            src={destination.image || "/placeholder.svg"}
            alt={destination.name}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay qui apparaît au survol */}
          <div
            className={`absolute inset-0 bg-black/70 flex flex-col justify-center p-6 transition-opacity duration-300 ${
              hoveredId === destination.id ? "opacity-100" : "opacity-0"
            }`}
          >
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-2xl font-bold text-white">{destination.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <p className="text-white/90">{destination.longDescription}</p>

              <div className="flex items-center text-white/80">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{destination.location}</span>
              </div>

              <div className="flex items-center text-white/80">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Meilleure période: {destination.bestTime}</span>
              </div>
            </CardContent>

            <CardFooter className="p-0 pt-4">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href={`Activities/${destination.id}`}>
                  Voir les activités
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </div>

          {/* Légende toujours visible quand pas de survol */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
              hoveredId === destination.id ? "opacity-0" : "opacity-100"
            }`}
          >
            <h3 className="text-xl font-semibold text-white">{destination.name}</h3>
            <p className="text-sm text-white/90">{destination.description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

