"use client"

import { Star, Users, Award, Sparkles, ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    label: "Avis clients",
    value: "4.8/5",
    icon: ThumbsUp,
    description: "Satisfaction garantie",
  },
  {
    label: "Utilisateurs",
    value: "50k+",
    icon: Users,
    description: "Voyageurs satisfaits",
  },
  {
    label: "Guides certifiés",
    value: "200+",
    icon: Award,
    description: "Experts locaux",
  },
  {
    label: "Expériences",
    value: "1000+",
    icon: Sparkles,
    description: "Activités uniques",
  },
]

const testimonials = [
  {
    quote: "Une expérience exceptionnelle avec des guides passionnés",
    author: "Marie L.",
    location: "Paris, France",
    rating: 5,
  },
  {
    quote: "Des découvertes incroyables hors des sentiers battus",
    author: "Ahmed K.",
    location: "Casablanca, Maroc",
    rating: 5,
  },
  {
    quote: "Le meilleur moyen de découvrir la Tunisie authentique",
    author: "John D.",
    location: "Londres, UK",
    rating: 5,
  },
]

export default function GlobalRating() {
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
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">La confiance de nos clients</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Découvrez pourquoi des milliers de voyageurs nous font confiance pour leurs aventures en Tunisie
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold mb-1 text-blue-600 dark:text-blue-400">{stat.value}</div>
                  <div className="text-gray-900 dark:text-white font-medium mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.description}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <Badge className="px-4 py-1 text-base bg-blue-600 hover:bg-blue-600">Témoignages</Badge>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg mb-4 text-gray-900 dark:text-white font-medium italic">
                      "{testimonial.quote}"
                    </p>
                    <div className="mt-auto">
                      <p className="font-semibold text-blue-600 dark:text-blue-400">{testimonial.author}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-10 text-center"
          >
            <Card className="border-0 shadow-md bg-blue-50 dark:bg-blue-900/20 inline-block px-8 py-4">
              <CardContent className="p-0 flex items-center">
                <ThumbsUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-gray-900 dark:text-white">Plus de 10 000 avis vérifiés</span>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

