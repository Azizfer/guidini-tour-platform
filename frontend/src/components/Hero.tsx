"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Clock, Star, Shield, Award, Search, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function Hero() {
  const [offset, setOffset] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleScroll = () => setOffset(window.pageYOffset)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleVideo = () => {
    const video = document.querySelector("video")
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Recherche pour:", searchQuery)
    // Logique de recherche
  }

  const features = [
    { icon: Award, title: "Meilleures activités", description: "Sélectionnées avec soin" },
    { icon: Clock, title: "Service 24h/24", description: "À votre disposition" },
    { icon: Star, title: "Avis vérifiés", description: "Voyageurs satisfaits" },
    { icon: Shield, title: "Prix transparents", description: "Sans surcoûts cachés" },
  ]

  return (
    <section className="relative h-[85vh] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          y: offset * 0.5,
        }}
      >
        <video className="w-full h-full object-cover" autoPlay={isPlaying} loop muted playsInline preload="auto">
          <source src="/videos/TunisiaVideo.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
        <div className="absolute inset-0 bg-black/40 backdrop-filter backdrop-blur-[2px]"></div>
      </motion.div>

      <div className="relative h-full flex flex-col items-center justify-center text-white px-4 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 drop-shadow-md"
        >
          Découvrez la Tunisie Authentique
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-center mb-8 font-medium drop-shadow-md max-w-2xl"
        >
          Visites guidées et excursions locales pour une expérience inoubliable
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-2xl mb-12"
          onSubmit={handleSearch}
        >
          <div className="flex flex-col sm:flex-row shadow-lg rounded-lg overflow-hidden">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Où voulez-vous partir ?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-10 py-6 rounded-none sm:rounded-l-lg text-gray-800 focus:outline-none border-0 h-auto"
              />
            </div>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-none sm:rounded-r-lg transition-colors h-auto"
            >
              Rechercher
            </Button>
          </div>
        </motion.form>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          onClick={toggleVideo}
          className="flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition-colors backdrop-blur-sm"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? "Pause" : "Play"} Video</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute bottom-0 left-0 right-0 py-6 backdrop-blur-sm bg-black/30"
        >
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="bg-transparent border-0 shadow-none">
                  <CardContent className="flex flex-col items-center text-center p-2">
                    <feature.icon className="w-6 h-6 text-blue-400 mb-2" />
                    <h3 className="text-sm font-semibold mb-1 text-white drop-shadow-md">{feature.title}</h3>
                    <p className="text-xs text-white/80 drop-shadow-md">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

