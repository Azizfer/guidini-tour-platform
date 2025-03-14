"use client"
import { Star, Award, MessageCircle } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const guides = [
  {
    name: "Ahmed",
    specialty: "Histoire & Culture",
    rating: 4.9,
    reviews: 127,
    image: "/images/Guide1.png",
    languages: ["Français", "Anglais", "Arabe"],
    experience: "5 ans",
  },
  {
    name: "Sarah",
    specialty: "Gastronomie",
    rating: 4.8,
    reviews: 98,
    image: "/images/Guide3.png",
    languages: ["Français", "Anglais", "Italien"],
    experience: "3 ans",
  },
  {
    name: "Mohamed",
    specialty: "Aventure",
    rating: 4.9,
    reviews: 156,
    image: "/images/Guide2.png",
    languages: ["Français", "Anglais", "Espagnol"],
    experience: "7 ans",
  },
]

export default function PopularGuides() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Nos Guides Certifiés</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Voyagez avec des experts locaux passionnés qui connaissent les meilleurs endroits
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guides.map((guide, index) => (
            <motion.div
              key={guide.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GuideCard guide={guide} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

interface GuideCardProps {
  guide: {
    name: string
    specialty: string
    rating: number
    reviews: number
    image: string
    languages: string[]
    experience: string
  }
}

function GuideCard({ guide }: GuideCardProps) {
  const [loading, setLoading] = useState(true)

  return (
    <Card className="overflow-hidden h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative bg-gradient-to-b from-blue-600 to-blue-800 pt-8 pb-20">
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            <AvatarImage src={guide.image} alt={guide.name} onLoad={() => setLoading(false)} />
            <AvatarFallback className="text-2xl">{guide.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="pt-20 pb-4 px-6 text-center">
        <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-1">{guide.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-3">{guide.specialty}</p>

        <div className="flex items-center justify-center mb-4">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          <span className="ml-1 text-gray-700 dark:text-gray-300">{guide.rating}</span>
          <span className="ml-2 text-gray-500 dark:text-gray-400">({guide.reviews} avis)</span>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {guide.languages.map((language) => (
            <Badge
              key={language}
              variant="outline"
              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {language}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <Award className="w-4 h-4 mr-1" />
            <span>{guide.experience}</span>
          </div>
          <div className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            <span>Répond en 2h</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0 flex justify-center">
        <Button className="bg-blue-600 hover:bg-blue-700 w-full">Contacter</Button>
      </CardFooter>
    </Card>
  )
}

