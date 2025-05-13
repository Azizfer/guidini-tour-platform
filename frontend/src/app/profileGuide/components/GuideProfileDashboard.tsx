"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import ProfileCard from "./ProfileCard"
import DashboardStats from "./DashboardStats"
import TabNavigation from "./TabNavigation"

export default function GuideProfileDashboard() {
  const [activeTab, setActiveTab] = useState("tours")
  const [scrollY, setScrollY] = useState(0)

  // Effet de parallaxe au scroll
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const guide = {
    name: "Ahmed Ben Salah",
    email: "ahmed@guidini.com",
    avatar: "/placeholder.svg?height=100&width=100",
    location: "Sousse, Tunisie",
    bio: "Guide touristique professionnel avec 5 ans d'expérience mettant en valeur la beauté de la Tunisie",
    rating: 4.8,
    reviewCount: 124,
    toursCount: 15,
    reservationsCount: 8,
    unreadNotifications: 3,
    unreadMessages: 2,
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fond avec effet de parallaxe */}
      <motion.div
        className="absolute inset-0 z-0 bg-gradient-to-b from-teal-50 to-blue-50 opacity-70"
        style={{ y: scrollY * 0.1 }}
      >
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
      </motion.div>

      {/* Contenu principal */}
      <div className="relative z-10 container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <ProfileCard guide={guide} />
          <DashboardStats guide={guide} />
        </div>
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  )
}
