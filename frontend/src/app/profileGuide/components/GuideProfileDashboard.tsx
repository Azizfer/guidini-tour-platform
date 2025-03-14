"use client"

import { useState } from "react"
import  ProfileCard  from "./ProfileCard"
import  DashboardStats  from "./DashboardStats"
import  TabNavigation  from "./TabNavigation"

export default function GuideProfileDashboard() {
  const [activeTab, setActiveTab] = useState("tours")

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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <ProfileCard guide={guide} />
        <DashboardStats guide={guide} />
      </div>
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}