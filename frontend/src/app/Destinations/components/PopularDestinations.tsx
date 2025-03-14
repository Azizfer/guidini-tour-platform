"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const destinations = [
  {
    name: "Carthage",
    image: "/images/Photo de carthage.jpg",
    description: "Site historique UNESCO",
  },
  {
    name: "Sidi Bou Said",
    image: "/images/Photo de sidi bou said.jpg",
    description: "Village pittoresque méditerranéen",
  },
  {
    name: "Djerba",
    image: "/images/Photo de djerba.jpg",
    description: "Île aux mille couleurs",
  },
]

export default function PopularDestinations() {
  return (
    <section className="py-16 bg-white dark:bg-[#217.2_32.6%_17.5%]">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white"
        >
          Destinations Populaires
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl shadow-lg cursor-pointer"
            >
              <div className="relative h-80">
                <Image
                  src={dest.image || "/placeholder.svg"}
                  alt={`Photo de ${dest.name}`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-semibold">{dest.name}</h3>
                  <p className="text-sm opacity-90">{dest.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mt-10"
        >
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-meduim">
            <Link href="/Destinations">
              Voir les destinations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

