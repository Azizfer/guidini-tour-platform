"use client"

import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  CalendarIcon,
  QuestionMarkCircleIcon,
  HomeIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
} from "@heroicons/react/24/outline"
import { ProfileAvatar } from "./profile-avatar";
import { DashboardStats } from "./dashboard-stats";
import ToursManagement from "./tours-management";
import GuideGallery from "./guide-gallery";
import GuideReservations from "./guide-reservations";
import Help from "./help";

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<string>("dashboard")

  // Mock guide data
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
    totalRevenue: 2650,
    touristsCount: 87,
    paymentsReceived: 18,
    languages: ["Français", "Anglais", "Arabe"],
    experience: 5,
    expertise: ["Histoire", "Culture", "Gastronomie"],
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar className="border-r border-gray-100">
        <SidebarHeader className="flex flex-col items-center py-4 px-3 border-b border-gray-100 mb-6">
          <ProfileAvatar guide={guide} />
        </SidebarHeader>
        
        <SidebarContent className="pt-12">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("dashboard")}
                active={activeTab === "dashboard"}
                className="flex items-center gap-3"
              >
                <HomeIcon className="h-5 w-5" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("tours")}
                active={activeTab === "tours"}
                className="flex items-center gap-3"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Mes Tours</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("reservations")}
                active={activeTab === "reservations"}
                className="flex items-center gap-3"
              >
                <UsersIcon className="h-5 w-5" />
                <span>Réservations</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("gallery")}
                active={activeTab === "gallery"}
                className="flex items-center gap-3"
              >
                <PhotoIcon className="h-5 w-5" />
                <span>Galerie</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("messages")}
                active={activeTab === "messages"}
                className="flex items-center gap-3"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>Messages</span>
                {guide.unreadMessages > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                    {guide.unreadMessages}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarSeparator className="my-2" />

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("help")}
                active={activeTab === "help"}
                className="flex items-center gap-3"
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
                <span>Aide</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <DashboardStats guide={guide} />
            </div>
          )}

          {activeTab === "tours" && <ToursManagement />}
          {activeTab === "gallery" && <GuideGallery />}
          {activeTab === "reservations" && <GuideReservations />}
          {activeTab === "help" && <Help />}

          {activeTab === "messages" && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-slate-900">Messages</h1>
              <p className="text-slate-600">Fonctionnalité de messagerie à venir...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
