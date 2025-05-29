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
import GuideStats from "./guide-stats";
import Help from "./help";
import guideService, { Guide } from "@/services/guideService";
import preferenceService from "@/services/preferenceService";
import { useAuth } from "@/app/LogingContext/AuthContext";

interface EnhancedGuide extends Guide {
  rating?: number;
  reviewCount?: number;
  toursCount?: number;
  completedToursCount?: number;
  privateToursCount?: number;
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
      
      // Vérifier que le backend est accessible
      try {
        // Fetch guide data from the API
        console.log("Fetching guide data for user ID:", userId);
        const guideData = await guideService.getGuideById(userId);
        console.log("Guide data received:", guideData);
        
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
        
        // Extract tour stats from guide data
        const stats = guideData.stats || {};
        console.log("Guide stats from API:", stats);
        
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
          toursCount: stats.activeTours || 0,
          completedToursCount: stats.completedTours || 0,
          // For private tours, we'll use a default value of 0 since the backend doesn't provide it directly
          // In a real implementation, you would need to add this to the backend API
          privateToursCount: 0,
          reservationsCount: stats.totalBookings || 0,
          rating: stats.averageRating || 0,
          reviewCount: guideData.reviewCount || 0,
          unreadNotifications: guideData.unreadMessages || 0,
          unreadMessages: guideData.unreadMessages || 0,
          totalRevenue: guideData.totalRevenue || 0,
          touristsCount: guideData.touristsCount || 0,
          paymentsReceived: guideData.paymentsReceived || 0,
          // Ne pas utiliser les gouvernorats couverts
          location: guideData.location || "Tunisie"
        };
        
        setGuide(enhancedGuide);
      } catch (apiError: any) {
        console.error("Erreur API lors du chargement du profil:", apiError);
        
        // Construire un message d'erreur détaillé
        let errorMessage = "Impossible de charger les données du profil";
        
        if (apiError.message && apiError.message.includes("backend n'a pas répondu")) {
          errorMessage = "Le serveur backend n'est pas accessible. Vérifiez qu'il est en cours d'exécution.";
        } else if (apiError.response && apiError.response.status === 404) {
          errorMessage = "Profil guide non trouvé. Vérifiez l'ID de l'utilisateur.";
        } else if (apiError.response && apiError.response.status === 401) {
          errorMessage = "Vous n'avez pas l'autorisation d'accéder à ce profil.";
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Erreur générale lors du chargement du profil:", err);
      setError("Une erreur inattendue s'est produite. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les données du profil au chargement initial
  useEffect(() => {
    fetchGuideProfile();
    
    // Set up event listener for tour status changes
    const handleTourStatusChange = (event: Event) => {
      console.log('Tour status changed, refreshing guide profile');
      // Force a refresh of the guide profile to get updated stats
      fetchGuideProfile();
      
      // Store the tour status change in localStorage for the dashboard
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        localStorage.setItem('lastDashboardEvent', 'tourStatusChanged');
        localStorage.setItem('lastTourStatus', customEvent.detail.status || '');
        localStorage.setItem('previousTourStatus', customEvent.detail.previousStatus || 'active');
      }
    };
    
    // Listen for tour status changes
    window.addEventListener('tourStatusChanged', handleTourStatusChange);
    window.addEventListener('refreshDashboard', fetchGuideProfile);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('tourStatusChanged', handleTourStatusChange);
      window.removeEventListener('refreshDashboard', fetchGuideProfile);
    };
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
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error || "Données du profil non disponibles"}</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => fetchGuideProfile()} 
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md"
            >
              Réessayer
            </button>
            <button 
              onClick={() => window.location.href = '/'} 
              className="px-6 py-2 text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              Retour à l'accueil
            </button>
          </div>
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
              <GuideStats />
              <div className="mt-8">
                <DashboardStats guide={guide} />
              </div>
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
