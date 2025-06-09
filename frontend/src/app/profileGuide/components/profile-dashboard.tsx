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
  UsersIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline"
import { ProfileAvatar } from "./profile-avatar"
import { DashboardStats } from "./dashboard-stats"
import ToursManagement from "./tours-management"
import GuideGallery from "./guide-gallery"
import GuideReservations from "./guide-reservations"
import GuideStats from "./guide-stats"
import Help from "./help"
import guideService, { type Guide } from "@/services/guideService"
import preferenceService from "@/services/preferenceService"
import { useAuth } from "@/app/LogingContext/AuthContext"

interface EnhancedGuide extends Guide {
  rating?: number
  reviewCount?: number
  toursCount?: number
  completedToursCount?: number
  privateToursCount?: number
  paymentsReceived?: number
  unreadNotifications?: number
  unreadMessages?: number
  totalRevenue?: number
  touristsCount?: number
  experience?: number
  avatar?: string
  bio?: string
  website?: string
}

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [guide, setGuide] = useState<EnhancedGuide | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const { user } = useAuth()

  // Show loading animation on page transitions
  useEffect(() => {
    // Simulate page loading
    setIsPageLoading(true)
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [activeTab])

  // Fonction pour récupérer les données du profil guide
  const fetchGuideProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Utiliser l'ID de l'utilisateur connecté ou un ID par défaut pour le développement
      const userId = user?.id || "682e10803651e668c119fbaf"
      console.log("Fetching profile for user ID:", userId)

      // Vérifier que le backend est accessible
      try {
        // Fetch guide data from the API
        console.log("Fetching guide data for user ID:", userId)
        const guideData = await guideService.getGuideById(userId)
        console.log("Guide data received:", guideData)

        // Fetch user preferences to get languages
        let userLanguages: string[] = []
        try {
          console.log("Fetching preferences for user ID:", userId)
          const preferences = await preferenceService.getUserPreferences(userId)
          userLanguages = preferences.languages || []
          console.log("User languages from preferences:", userLanguages)
        } catch (prefError) {
          console.error("Erreur lors de la récupération des préférences:", prefError)
          // Use languages from guide data as fallback
          userLanguages = guideData.languages || []
          console.log("Using languages from guide data as fallback:", userLanguages)
        }

        // Extract tour stats from guide data
        const statsAny: any = guideData.stats || {}
        console.log("Guide stats from API:", statsAny)

        // Transform the data to match our UI needs
        const enhancedGuide: EnhancedGuide = {
          ...guideData,
          // Map backend fields to frontend expected fields
          avatar: guideData.profileImage || "/placeholder.svg?height=100&width=100",
          bio: guideData.description || "Aucune description disponible",
          experience: guideData.yearsOfExperience || 0,
          // Use languages from preferences
          languages: userLanguages,
          // Get stats from the stats object in the guide data
          toursCount: statsAny.activeTours || 0,
          completedToursCount: statsAny.completedTours || 0,
          // For private tours, we'll use a default value of 0 since the backend doesn't provide it directly
          // In a real implementation, you would need to add this to the backend API
          privateToursCount: 0,
          paymentsReceived: statsAny.paymentsReceived || 0,
          rating: statsAny.averageRating || 0,
          reviewCount: guideData.reviewCount || 0,
          unreadNotifications: guideData.unreadMessages || 0,
          unreadMessages: guideData.unreadMessages || 0,
          totalRevenue: guideData.totalRevenue || 0,
          touristsCount: guideData.touristsCount || 0,
          // Ne pas utiliser les gouvernorats couverts
          location: guideData.location || "Tunisie",
        }

        setGuide(enhancedGuide)
      } catch (apiError: any) {
        console.error("Erreur API lors du chargement du profil:", apiError)

        // Construire un message d'erreur détaillé
        let errorMessage = "Impossible de charger les données du profil"

        if (apiError.message && apiError.message.includes("backend n'a pas répondu")) {
          errorMessage = "Le serveur backend n'est pas accessible. Vérifiez qu'il est en cours d'exécution."
        } else if (apiError.response && apiError.response.status === 404) {
          errorMessage = "Profil guide non trouvé. Vérifiez l'ID de l'utilisateur."
        } else if (apiError.response && apiError.response.status === 401) {
          errorMessage = "Vous n'avez pas l'autorisation d'accéder à ce profil."
        }

        setError(errorMessage)
      }
    } catch (err) {
      console.error("Erreur générale lors du chargement du profil:", err)
      setError("Une erreur inattendue s'est produite. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  // Charger les données du profil au chargement initial
  useEffect(() => {
    fetchGuideProfile()

    // Set up event listener for tour status changes
    const handleTourStatusChange = (event: Event) => {
      console.log("Tour status changed, refreshing guide profile")
      // Force a refresh of the guide profile to get updated stats
      fetchGuideProfile()

      // Store the tour status change in localStorage for the dashboard
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        localStorage.setItem("lastDashboardEvent", "tourStatusChanged")
        localStorage.setItem("lastTourStatus", customEvent.detail.status || "")
        localStorage.setItem("previousTourStatus", customEvent.detail.previousStatus || "active")
      }
    }

    // Add event listener for user profile updates
    const handleUserProfileUpdated = (event: Event) => {
      console.log("User profile updated, refreshing guide profile")
      fetchGuideProfile()
    }
    
    // Add event listener for payment updates
    const handlePaymentUpdate = (event: Event) => {
      console.log("Payment update detected, refreshing guide profile")
      fetchGuideProfile()
    }
    
    // Add event listener for reservation updates
    const handleReservationUpdate = (event: Event) => {
      console.log("Reservation update detected, refreshing guide profile")
      fetchGuideProfile()
    }
    
    // Add event listener for notification updates
    const handleNotificationUpdate = (event: Event) => {
      console.log("Notification update detected, refreshing guide profile")
      fetchGuideProfile()
    }

    // Listen for tour status changes and user profile updates
    window.addEventListener("tourStatusChanged", handleTourStatusChange)
    window.addEventListener("refreshDashboard", fetchGuideProfile)
    window.addEventListener("userProfileUpdated", handleUserProfileUpdated)
    window.addEventListener("paymentUpdate", handlePaymentUpdate)
    window.addEventListener("reservationUpdate", handleReservationUpdate)
    window.addEventListener("notificationUpdate", handleNotificationUpdate)

    return () => {
      // Clean up event listeners
      window.removeEventListener("tourStatusChanged", handleTourStatusChange)
      window.removeEventListener("refreshDashboard", fetchGuideProfile)
      window.removeEventListener("userProfileUpdated", handleUserProfileUpdated)
      window.removeEventListener("paymentUpdate", handlePaymentUpdate)
      window.removeEventListener("reservationUpdate", handleReservationUpdate)
      window.removeEventListener("notificationUpdate", handleNotificationUpdate)
    }
  }, [user])

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !guide) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 justify-center items-center">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error || "Données du profil non disponibles"}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => fetchGuideProfile()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
            >
              Réessayer
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar className="border-r border-gray-200 bg-white shadow-md">
        {/* Sticky avatar section at the very top */}
        <div className="w-full sticky top-0 z-20 bg-white flex flex-col items-center pt-10 pb-8 px-3 border-b border-gray-100">
          <ProfileAvatar guide={guide} />
          <div className="w-full border-b border-gray-200 my-8"></div>
        </div>

        <SidebarContent className="pt-36">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("dashboard")}
                active={activeTab === "dashboard"}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                <HomeIcon className="h-5 w-5" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("tours")}
                active={activeTab === "tours"}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Mes Tours</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("payments")}
                active={activeTab === "payments"}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                <UsersIcon className="h-5 w-5" />
                <span>Paiements</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("gallery")}
                active={activeTab === "gallery"}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                <PhotoIcon className="h-5 w-5" />
                <span>Galerie</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarSeparator className="my-4 bg-gray-200" />

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveTab("help")}
                active={activeTab === "help"}
                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
                <span>Aide</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-gray-100 p-4">
          <SidebarMenuButton className="flex items-center gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50 w-full">
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span>Déconnexion</span>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <div className="text-sm text-gray-500">
                  Bienvenue, <span className="font-medium text-blue-600">{guide.name}</span>
                </div>
              </div>
              <GuideStats />
              <div className="mt-8">
                <DashboardStats guide={guide} />
              </div>
            </div>
          )}

          {activeTab === "tours" && <ToursManagement />}
          {activeTab === "gallery" && <GuideGallery />}
          {activeTab === "payments" && <GuideReservations />}
          {activeTab === "help" && <Help />}
        </div>
      </main>
    </div>
  )
}
