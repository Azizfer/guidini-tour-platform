"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAllTours, Tour } from "@/services/toursService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Search,
  Filter,
  ChevronDown,
  Compass,
  Clock,
  Users,
  Award,
  Heart,
  Star,
  MapPin,
  Calendar,
  X,
  Info,
  ArrowRight
} from "lucide-react"
import PaymentCard from "./payment-card"
import ActivityDetailsPopup from "./activity-details-popup"
import ParticipantCounter from "./participant-counter"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { useSearchParams } from "next/navigation"

// Define categories for filtering
const categories = ["Toutes", "Histoire", "Culture", "Aventure", "Sport", "Gastronomie", "Visite"]

// Define sort options
const sortOptions = [
  { label: "Prix (croissant)", value: "price_asc" },
  { label: "Prix (décroissant)", value: "price_desc" },
]

export default function AllActivities() {
  const [activities, setActivities] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Toutes"])
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc">("price_asc")
  const [visibleCount, setVisibleCount] = useState(12)
  const [showPaymentCard, setShowPaymentCard] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Tour | null>(null)
  const [showDetailsPopup, setShowDetailsPopup] = useState(false)
  const [activityForDetails, setActivityForDetails] = useState<Tour | null>(null)
  const [participants, setParticipants] = useState(1)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  // Fetch activities data from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true)
        const data = await getAllTours()
        
        // Process guide information consistently
        const processedActivities = await Promise.all(data.map(async (activity) => {
          // Skip processing if no guide ID or already has valid guide name
          if (!activity.guideId || 
              (activity.guideName && 
               activity.guideName !== 'Guide Professionnel' && 
               !activity.guideName.startsWith('Guide '))) {
            return activity;
          }
          
          try {
            // Import the necessary services
            const { getCachedUserById } = await import('@/services/userService');
            const guideService = (await import('@/services/guideService')).default;
            
            // Try to get guide info from guideService first
            try {
              const guideData = await guideService.getGuideById(activity.guideId);
              if (guideData && guideData.name && !guideData.error) {
                console.log(`Found guide name for activity ${activity.title}: ${guideData.name}`);
                return {
                  ...activity,
                  guideName: guideData.name,
                  guide: {
                    _id: guideData._id,
                    name: guideData.name,
                    profilePicture: guideData.profileImage || guideData.avatar
                  }
                };
              }
            } catch (guideError) {
              console.log('Failed to get guide from guideService, trying cached user');
            }
            
            // Try cached user service as fallback
            const userData = await getCachedUserById(activity.guideId);
            if (userData && userData.name && userData.name !== 'Guide Professionnel') {
              console.log(`Found user data for guide ${activity.guideId}: ${userData.name}`);
              return {
                ...activity,
                guideName: userData.name,
                guide: {
                  _id: userData._id || userData.id,
                  name: userData.name,
                  profilePicture: userData.profilePicture
                }
              };
            }
          } catch (error) {
            console.log(`Error fetching guide info for activity ${activity.title}:`, error);
          }
          
          return activity;
        }));
        
        setActivities(processedActivities);
      } catch (err) {
        console.error("Error fetching activities:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  // Check for activityId in URL and open payment card
  useEffect(() => {
    const activityId = searchParams.get('activityId')
    console.log('Checking for activityId in URL:', activityId)

    if (activityId && activities.length > 0) {
      const activityToOpen = activities.find(activity =>
        activity._id === activityId || activity.id === activityId
      )
      console.log('Found activity to open payment card:', activityToOpen)
      if (activityToOpen) {
        setSelectedActivity(activityToOpen)
        setShowPaymentCard(true)
      }
    }
  }, [activities, searchParams]) // Depend on activities and searchParams

  // Filtered activities based on search term, selected categories, and active status
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Only show active tours
      if (activity.tourStatus !== 'active') return false;
      
      // Search term matching
      const matchesSearch = searchTerm === "" || (
        activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.location?.toLowerCase().includes(searchTerm.toLowerCase())
      )

      // Category matching - must match ALL selected categories (intersection)
      const matchesCategory = selectedCategories.includes("Toutes") || 
        selectedCategories.every(selected => {
          if (selected === "Toutes") return true;
          
          // Handle both string and array categories (case-insensitive)
          if (typeof activity.category === 'string') {
            return selected.toLowerCase() === activity.category.toLowerCase() ||
                   selected === (activity.category.charAt(0).toUpperCase() + activity.category.slice(1));
          } else if (Array.isArray(activity.category)) {
            return activity.category.some(cat => 
              selected.toLowerCase() === cat.toLowerCase() ||
              selected === (cat.charAt(0).toUpperCase() + cat.slice(1))
            );
          }
          return false;
        });

      return matchesSearch && matchesCategory;
    })
  }, [activities, searchTerm, selectedCategories])

  // Sort filtered activities based on selected sort option
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price
    if (sortBy === "price_desc") return b.price - a.price
    if (sortBy === "rating_desc") return (b.rating || 0) - (a.rating || 0)
    return 0
  })

  const visibleActivities = sortedActivities.slice(0, visibleCount)

  // Reset all filters to default values
  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategories(["Toutes"])
    setSortBy("price_asc")
  }

  // Toggle favorite status (placeholder function)
  const toggleFavorite = (id: string): void => {
    console.log("Toggle favorite for activity:", id)
  }

  const loadMore = () => {
    setVisibleCount((prev) => prev + 6)
  }

  const handleReserve = (id: string) => {
    console.log('Reserve button clicked for activity ID:', id)
    console.log('Activities data:', activities)
    
    // First try to find by exact match
    let activity = activities.find(a => 
      a.id === id || a._id === id
    )
    
    // If not found, try string comparison
    if (!activity) {
      activity = activities.find(a => 
        (a.id && a.id.toString() === id.toString()) || 
        (a._id && a._id.toString() === id.toString())
      )
    }
    
    // If still not found, try more lenient matching
    if (!activity) {
      activity = activities.find(a => 
        (a.id && id.includes(a.id)) || 
        (a._id && id.includes(a._id)) ||
        (a.id && a.id.includes(id)) || 
        (a._id && a._id.includes(id))
      )
    }
    
    if (activity) {
      console.log('Found activity to reserve:', activity)
      
      // Set both states at once for better synchronization
      setSelectedActivity(activity)
      setShowPaymentCard(true)
      
      // Log the state changes
      console.log('Set selectedActivity:', activity)
      console.log('Set showPaymentCard to true')
    } else {
      console.error('Activity not found with ID:', id)
      console.log('Activities array length:', activities.length)
      console.log('First few activities:', activities.slice(0, 3))
      
      // Try to handle the activity directly
      try {
        // If we can't find the activity in the array, create a temporary one from the clicked card
        const tempActivity = {
          id: id,
          _id: id,
          title: 'Activité sélectionnée',
          price: 10, // Default price
          maxParticipants: 10,
          guideId: ''
        }
        
        console.log('Using temporary activity:', tempActivity)
        setSelectedActivity(tempActivity as Tour)
        setShowPaymentCard(true)
      } catch (error) {
        console.error('Error creating temporary activity:', error)
        alert('Impossible de trouver cette activité. Veuillez réessayer.')
      }
    }
  }

  const handleClosePaymentCard = () => {
    setShowPaymentCard(false)
    setSelectedActivity(null)
    setParticipants(1) // Reset participants count when closing
  }

  const handleShowDetails = (activity: Tour) => {
    // Set the activity first, then show the popup
    setActivityForDetails(activity)
    setShowDetailsPopup(true)
  }

  const handleCloseDetails = () => {
    setShowDetailsPopup(false)
  }

  // Debug state values and force re-render when payment card should be shown
  useEffect(() => {
    if (showPaymentCard && selectedActivity) {
      console.log('Payment card should be visible now with:', selectedActivity)
      
      // Force a re-render by using a small timeout
      const timer = setTimeout(() => {
        console.log('Forcing re-render of payment card')
        // This is just to trigger a re-render
        setShowPaymentCard(true)
      }, 50)
      
      return () => clearTimeout(timer)
    }
  }, [showPaymentCard, selectedActivity])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden pt-16">
      {/* Payment Card Modal */}
      {showPaymentCard && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '550px', width: '100%' }}
          >
            <button
              onClick={handleClosePaymentCard}
              className="absolute right-4 top-4 z-10 text-gray-400 hover:text-gray-600 bg-white/80 rounded-full shadow-sm p-1"
            >
              <X className="h-4 w-4" />
            </button>
            
            <PaymentCard
              activity={{
                title: selectedActivity.title,
                price: selectedActivity.price || 0,
                id: selectedActivity._id || selectedActivity.id || '',
                maxParticipants: selectedActivity.maxParticipants || 10,
                guideId: selectedActivity.guide?._id || selectedActivity.guideId || '',
                date: selectedActivity.date
              }}
              onClose={handleClosePaymentCard}
            />
          </div>
        </div>
      )}
      {/* Activity Details Popup - Always rendered but only visible when isOpen=true */}
      <ActivityDetailsPopup
        activity={{
          id: activityForDetails?.id || activityForDetails?._id || '',
          title: activityForDetails?.title || '',
          description: activityForDetails?.description || '',
          image: activityForDetails?.image || '/images/placeholder-activity.jpg',
          price: activityForDetails?.price || 0,
          duration: activityForDetails?.duration || '',
          maxParticipants: activityForDetails?.maxParticipants || 0,
          location: activityForDetails?.location || '',
          dates: activityForDetails?.date ? [activityForDetails.date] : [],
          category: typeof activityForDetails?.category === 'string' ? 
            activityForDetails.category : 
            (Array.isArray(activityForDetails?.category) ? activityForDetails?.category[0] : 'Activité'),
          guideId: activityForDetails?.guideId || '',
          guideName: activityForDetails?.guideName || '',
          guide: activityForDetails?.guide || null,
          rating: activityForDetails?.rating || 0,
          reviewCount: activityForDetails?.reviewCount || 0
        }}
        isOpen={showDetailsPopup}
        onClose={handleCloseDetails}
      />
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white py-14 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/images/pattern-bg.png')] bg-repeat opacity-10"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-3"
            >
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-teal-100">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-100 via-white to-blue-100 bg-clip-text text-transparent tracking-tight mb-3">
                Activités & Expériences
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-sm md:text-base font-normal max-w-2xl mx-auto leading-relaxed text-blue-100 mt-2">
                Découvrez des expériences uniques et authentiques qui rendront votre voyage en Tunisie inoubliable
              </p>
            </motion.div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-12 fill-white">
            <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex flex-col md:flex-row gap-4 sticky top-4 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-gray-200 shadow-lg"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
            <Input
              type="text"
              placeholder="Rechercher une activité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus-visible:ring-blue-500 rounded-full"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {/* Category filter */}
            <div>
              <Label htmlFor="category" className="sr-only">Catégorie</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 whitespace-nowrap border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-full px-6"
                  >
                    Catégorie: {selectedCategories.includes("Toutes") ? "Toutes" : 
                              selectedCategories.length > 1 ? 
                              `${selectedCategories.length} sélectionnées` : 
                              selectedCategories[0]}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl border-blue-100">
                  {categories.map((category) => (
                    <div
                      key={category}
                      className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-blue-50 ${selectedCategories.includes(category) ? "bg-blue-100 font-medium" : ""}`}
                      onClick={() => {
                        if (category === "Toutes") {
                          setSelectedCategories(["Toutes"])
                        } else {
                          const newCategories = selectedCategories.filter((c: string) => c !== "Toutes")
                          if (selectedCategories.includes(category)) {
                            // Remove this category
                            const filtered = newCategories.filter((c: string) => c !== category)
                            setSelectedCategories(filtered.length === 0 ? ["Toutes"] : filtered)
                          } else {
                            // Add this category
                            setSelectedCategories([...newCategories, category])
                          }
                        }
                      }}
                    >
                      {category}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Sort dropdown */}
            <div>
              <Label htmlFor="sort" className="sr-only">Trier par</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 whitespace-nowrap border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-full px-6"
                  >
                    Trier: {sortOptions.find(option => option.value === sortBy)?.label}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl border-blue-100">
                  {sortOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`px-2 py-1.5 text-sm cursor-pointer hover:bg-blue-50 ${sortBy === option.value ? "bg-blue-100 font-medium" : ""}`}
                      onClick={() => setSortBy(option.value as "price_asc" | "price_desc")}
                    >
                      {option.label}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {filteredActivities.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 mb-6 rounded-full bg-blue-50 flex items-center justify-center">
                <Search className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune activité trouvée</h3>
              <p className="text-gray-600 max-w-md mb-6 text-base font-normal">
                Essayez de modifier vos critères de recherche ou explorez d'autres catégories.
              </p>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:text-blue-800 px-6 py-2 rounded-md transition-all duration-300"
              >
                Réinitialiser les filtres
              </Button>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Results count */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold text-gray-900">{filteredActivities.length}</span> activité
                  {filteredActivities.length > 1 ? "s" : ""} trouvée{filteredActivities.length > 1 ? "s" : ""}
                </p>
              </div>

              {/* Activities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id || activity._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                    }}
                  >
                    <ActivityCard
                      activity={activity}
                      onReserve={handleReserve}
                      onShowDetails={handleShowDetails}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              {visibleCount < filteredActivities.length && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={loadMore}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-8 py-2 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Afficher plus d'activités
                    <span className="ml-2 text-sm bg-white/20 px-2 py-0.5 rounded-md font-normal">
                      {filteredActivities.length - visibleCount}
                    </span>
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const ActivityCard = ({ activity, onReserve, onShowDetails }: { 
  activity: Tour; 
  onReserve: (id: string) => void;
  onShowDetails: (activity: Tour) => void;
 }) => {
  const { id, title, description, price, duration, maxParticipants, location, image } = activity;

  // Function to handle the details button click
  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Details button clicked for:', title);
    onShowDetails(activity);
    return false;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
      {/* Image container */}
      <div className="relative h-[170px] overflow-hidden">
        <img
          src={image || "/images/placeholder-activity.jpg"}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Details button - appears on hover */}
        <button
          type="button"
          className="absolute top-2 right-2 z-20 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors duration-200 opacity-0 group-hover:opacity-100 shadow-sm"
          onClick={handleDetailsClick}
          aria-label="Voir les détails"
        >
          <Info className="h-4 w-4 text-blue-600" />
        </button>
        
        {/* Category badge */}
        <div className="absolute top-2 left-2 z-20">
          <Badge className="bg-blue-500 text-white font-normal hover:bg-blue-600 px-2 py-1 rounded-full">
            {typeof activity.category === 'string' ? activity.category : activity.category?.[0]}
          </Badge>
        </div>

        {/* Location badge at bottom of image */}
        <div className="absolute bottom-2 left-2 z-20">
          <Badge className="bg-white/80 text-gray-800 font-normal hover:bg-white px-2 py-1 rounded-full">
            {location}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-base text-gray-900 mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>

        {/* Duration info */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{duration} heures</span>
          
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-2 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Max {maxParticipants} pers.</span>
        </div>

        {/* Price and button */}
        <div className="mt-auto flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-gray-900">{price}DT</span>
            <span className="text-sm text-gray-600 ml-1">/Personne</span>
          </div>
          <Button
            onClick={() => {
              console.log('Clicking reserve with activity:', activity);
              // Pass the full activity object instead of just the ID
              onReserve(activity._id || activity.id || '');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full px-4 py-1 h-auto"
          >
            Réserver
          </Button>
        </div>
      </div>
    </div>
  );
};
