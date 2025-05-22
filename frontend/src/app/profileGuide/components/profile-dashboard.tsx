"use client"

import { useState, useEffect } from "react"
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
import guideService, { Guide } from "@/services/guideService";
import preferenceService from "@/services/preferenceService";
import { useAuth } from "@/app/LogingContext/AuthContext";

interface EnhancedGuide extends Guide {
  rating?: number;
  reviewCount?: number;
  toursCount?: number;
  reservationsCount?: number;
  unreadNotifications?: number;
  unreadMessages?: number;
  totalRevenue?: number;
  touristsCount?: number;
  paymentsReceived?: number;
  experience?: number;
  avatar?: string;
  bio?: string;
  website?: string;
}

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [guide, setGuide] = useState<EnhancedGuide | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fonction pour récupérer les données du profil guide
  const fetchGuideProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser l'ID de l'utilisateur connecté ou un ID par défaut pour le développement
      const userId = user?.id || "682e10803651e668c119fbaf";
      console.log("Fetching profile for user ID:", userId);
      
      // Fetch guide data from the API
      console.log("Fetching guide data for user ID:", userId);
      const guideData = await guideService.getGuideById(userId);
      
      // Fetch user preferences to get languages
      let userLanguages: string[] = [];
      try {
        console.log("Fetching preferences for user ID:", userId);
        const preferences = await preferenceService.getUserPreferences(userId);
        userLanguages = preferences.languages || [];
        console.log("User languages from preferences:", userLanguages);
      } catch (prefError) {
        console.error("Erreur lors de la récupération des préférences:", prefError);
        // Use languages from guide data as fallback
        userLanguages = guideData.languages || [];
        console.log("Using languages from guide data as fallback:", userLanguages);
      }
      
      // Transform the data to match our UI needs
      const enhancedGuide: EnhancedGuide = {
        ...guideData,
        // Map backend fields to frontend expected fields
        avatar: guideData.profileImage || "/placeholder.svg?height=100&width=100",
        bio: guideData.description || "Aucune description disponible",
        experience: guideData.yearsOfExperience || 0,
        // Use languages from preferences
        languages: userLanguages,
        // Default values for stats that might not be in the API response
        rating: 4.8, // TODO: Replace with real data when available
        reviewCount: 0,
        toursCount: 0,
        reservationsCount: 0,
        unreadNotifications: 0,
        unreadMessages: 0,
        totalRevenue: 0,
        touristsCount: 0,
        paymentsReceived: 0,
        // Ne pas utiliser les gouvernorats couverts
        location: guideData.location || "Tunisie"
      };
      
      setGuide(enhancedGuide);
    } catch (err) {
      console.error("Erreur lors du chargement du profil:", err);
      setError("Impossible de charger les données du profil. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };
  
  // Nous n'utilisons plus d'écouteurs d'événements personnalisés
  // car nous rechargeons la page après les mises à jour
  
  // Charger les données du profil au chargement initial
  useEffect(() => {
    fetchGuideProfile();
  }, [user]);
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-white justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error || !guide) {
    return (
      <div className="flex min-h-screen bg-white justify-center items-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error || "Données du profil non disponibles"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
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
                {(guide.unreadMessages || 0) > 0 && (
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
        </div>
      </main>
    </div>
  )
}
