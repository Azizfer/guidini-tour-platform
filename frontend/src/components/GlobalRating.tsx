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
    <section className="py-16 bg-[#f8f7f4]">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3 text-gray-800">La confiance de nos clients</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
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
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border shadow-md bg-white hover:shadow-lg transition-all duration-300 border-gray-100">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                    <stat.icon className="w-6 h-6 text-teal-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1 text-teal-600">{stat.value}</div>
                  <div className="text-gray-800 font-medium mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-500">{stat.description}</div>
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
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <Badge className="px-4 py-1 text-base bg-teal-500 text-white">Témoignages</Badge>
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
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border shadow-md bg-white hover:shadow-lg transition-all duration-300 border-gray-100 overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-lg mb-4 text-gray-800 font-medium italic">"{testimonial.quote}"</p>
                    <div className="mt-auto">
                      <p className="font-semibold text-teal-500">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">{testimonial.location}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
