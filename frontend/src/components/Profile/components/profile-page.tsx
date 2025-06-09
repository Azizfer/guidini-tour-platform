"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/app/LogingContext/AuthContext"
import Header from "@/components/Header"
import Footer from "@/components/footer"
import LoadingScreen from "@/components/loading-screen"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MapPinIcon, PhotoIcon, StarIcon } from "@heroicons/react/24/outline"

// Import the new components
import ProfileHeader from "./profile-header"
import TourCard from "./tour-card"
import CompletedTourCard from "./completed-tour-card"
import AddMemoryDialog from "./add-memory-dialog"
import AddReviewDialog from "./add-review-dialog"

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  userType: "guide" | "tourist"
  location: string
  bio: string
  joinedDate: string
  isVerified: boolean
  experience?: number
  languages?: string[]
  expertise?: string[]
  rating?: number
  reviewCount?: number
  toursCount?: number
  completedTours?: number
  priceRange?: string
  tripsCount?: number
  reviewsGiven?: number
  favoriteDestinations?: string[]
  travelStyle?: string[]
  nationality?: string
  age?: number
}

interface Tour {
  id: string
  title: string
  description: string
  image: string
  price: number
  duration: string
  maxParticipants: number
  rating: number
  reviewCount: number
  category: string
  nextDate?: string
  highlights: string[]
  isActive: boolean
  completedCount?: number
}

interface Memory {
  id: string
  tourId: string
  tourTitle: string
  images: string[]
  date: string
  location: string
  rating?: number
  review?: string
  hasReview: boolean
  canAddReview: boolean
  canAddGallery: boolean
}

interface Review {
  id: string
  rating: number
  comment: string
  date: string
  tourName?: string
  reviewerName?: string
  reviewerAvatar?: string
  guideResponse?: string
}

export default function ProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const { user } = useAuth()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("tours")
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTourTab, setActiveTourTab] = useState("active")

  // Dialog states
  const [showMemoryDialog, setShowMemoryDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [selectedTourForAction, setSelectedTourForAction] = useState<Tour | null>(null)

  const isOwnProfile = user?.id === userId

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchProfileData = async () => {
      setTimeout(() => {
        const mockProfile: UserProfile = {
          id: userId,
          name: "Ahmed Ben Salem",
          email: "ahmed.bensalem@email.com",
          avatar: "/placeholder.svg?height=120&width=120",
          userType: "guide",
          location: "Sousse, Tunisie",
          bio: "Guide touristique passionné avec plus de 5 ans d'expérience dans l'exploration des trésors cachés de la Tunisie. Spécialisé dans l'histoire antique, la culture locale et la gastronomie traditionnelle.",
          joinedDate: "2022-03-15",
          isVerified: true,
          experience: 5,
          languages: ["Français", "Anglais", "Arabe", "Italien"],
          expertise: ["Histoire Antique", "Architecture Islamique", "Gastronomie", "Artisanat Local"],
          rating: 4.8,
          reviewCount: 127,
          toursCount: 12,
          completedTours: 156,
          priceRange: "50-150 TND",
        }

        const mockTours: Tour[] = [
          {
            id: "1",
            title: "Visite historique de la Médina",
            description: "Découvrez l'histoire fascinante de Sousse à travers sa médina UNESCO",
            image: "/placeholder.svg?height=160&width=240",
            price: 75,
            duration: "3h",
            maxParticipants: 8,
            rating: 4.9,
            reviewCount: 45,
            category: "Histoire",
            nextDate: "2024-02-15",
            highlights: ["Médina UNESCO", "Ribat", "Grande Mosquée"],
            isActive: true,
            completedCount: 89,
          },
          {
            id: "2",
            title: "Tour gastronomique authentique",
            description: "Savourez les délices de la cuisine tunisienne traditionnelle",
            image: "/placeholder.svg?height=160&width=240",
            price: 95,
            duration: "4h",
            maxParticipants: 6,
            rating: 4.8,
            reviewCount: 32,
            category: "Gastronomie",
            nextDate: "2024-02-18",
            highlights: ["Marché local", "Dégustation", "Cours de cuisine"],
            isActive: true,
            completedCount: 67,
          },
          {
            id: "3",
            title: "Découverte de l'artisanat local",
            description: "Rencontrez les artisans et découvrez leurs techniques ancestrales",
            image: "/placeholder.svg?height=160&width=240",
            price: 60,
            duration: "2.5h",
            maxParticipants: 10,
            rating: 4.7,
            reviewCount: 28,
            category: "Artisanat",
            highlights: ["Ateliers traditionnels", "Démonstrations"],
            isActive: false,
            completedCount: 45,
          },
        ]

        const mockReviews: Review[] = [
          {
            id: "1",
            rating: 5,
            comment:
              "Guide exceptionnel ! Ahmed connaît parfaitement l'histoire de Sousse et sait la raconter de manière captivante. Une expérience inoubliable !",
            date: "2024-01-20",
            tourName: "Visite historique de la Médina",
            reviewerName: "Marie Dubois",
            reviewerAvatar: "/placeholder.svg?height=40&width=40",
            guideResponse: "Merci beaucoup Marie ! C'était un plaisir de vous faire découvrir notre belle ville.",
          },
        ]

        setProfile(mockProfile)
        setTours(mockTours)
        setReviews(mockReviews)
        setLoading(false)
      }, 1000)
    }

    fetchProfileData()
  }, [userId])

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const handleAddMemory = (tour: Tour) => {
    setSelectedTourForAction(tour)
    setShowMemoryDialog(true)
    // Navigate to memories tab
    setActiveTab("memories")
  }

  const handleAddReview = (tour: Tour) => {
    setSelectedTourForAction(tour)
    setShowReviewDialog(true)
    // Navigate to reviews tab
    setActiveTab("reviews")
  }

  const activeTours = tours.filter((tour) => tour.isActive)
  const completedTours = tours.filter((tour) => !tour.isActive)

  if (loading) {
    return <LoadingScreen />
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil non trouvé</h2>
            <p className="text-gray-600">Ce profil n'existe pas ou a été supprimé.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6 mt-20">
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={handleFollow}
        />

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-xl p-1 mb-8 shadow-sm">
            <TabsTrigger
              value="tours"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg text-sm font-medium"
            >
              <MapPinIcon className="h-4 w-4" />
              Tours
            </TabsTrigger>
            <TabsTrigger
              value="memories"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg text-sm font-medium"
            >
              <PhotoIcon className="h-4 w-4" />
              Souvenirs
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg text-sm font-medium"
            >
              <StarIcon className="h-4 w-4" />
              Avis
            </TabsTrigger>
          </TabsList>

          {/* Tours Tab */}
          <TabsContent value="tours">
            <div className="space-y-6">
              {/* Tour Sub-tabs */}
              <div className="flex gap-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTourTab("active")}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTourTab === "active"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Tours proposés ({activeTours.length})
                </button>
                <button
                  onClick={() => setActiveTourTab("completed")}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTourTab === "completed"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Tours réalisés ({completedTours.length})
                </button>
              </div>

              {/* Active Tours */}
              {activeTourTab === "active" && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {activeTours.map((tour, index) => (
                    <TourCard key={tour.id} tour={tour} index={index} isActive={true} />
                  ))}
                </div>
              )}

              {/* Completed Tours */}
              {activeTourTab === "completed" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedTours.map((tour, index) => (
                    <CompletedTourCard
                      key={tour.id}
                      tour={tour}
                      index={index}
                      onAddMemory={handleAddMemory}
                      onAddReview={handleAddReview}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Memories Tab */}
          <TabsContent value="memories">
            <div className="text-center py-16">
              <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun souvenir pour le moment</h3>
              <p className="text-gray-500 mb-6">
                Ajoutez des photos de vos expériences depuis la section "Tours réalisés"
              </p>
              <Button
                onClick={() => setActiveTab("tours")}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Voir les tours réalisés
              </Button>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={review.reviewerAvatar || "/placeholder.svg"}
                      alt={review.reviewerName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-gray-900">{review.reviewerName}</h4>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                      {review.guideResponse && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-3 rounded-r-lg">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Réponse du guide:</span> {review.guideResponse}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                        <span>{new Date(review.date).toLocaleDateString("fr-FR")}</span>
                        {review.tourName && <span>• {review.tourName}</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <AddMemoryDialog
        isOpen={showMemoryDialog}
        onClose={() => setShowMemoryDialog(false)}
        tourTitle={selectedTourForAction?.title}
      />

      <AddReviewDialog
        isOpen={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        tourTitle={selectedTourForAction?.title}
      />

      <Footer />
    </div>
  )
}
