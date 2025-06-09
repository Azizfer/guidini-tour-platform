"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MapPinIcon, PhotoIcon, StarIcon } from "@heroicons/react/24/outline"
import GuideTourCard from "./guide-tour-card"
import CompletedTourCard from "./completed-tour-card"
import AddMemoryDialog from "./add-memory-dialog"
import AddReviewDialog from "./add-review-dialog"
import axios from 'axios';
import { API_BASE_URL } from '@/config';
import { getAuthHeader } from '@/utils/auth';
import type { Tour } from '@/services/profileService';
import toast from '@/utils/toast';
import { useGuide } from '@/contexts/GuideContext';

interface UserProfile {
  id: string;
  name: string;
  userType: "guide" | "tourist";
  bio?: string; // Explicitly optional
  stats?: {
    activeTours?: number;
    completedTours?: number;
    averageRating?: number;
    totalReviews?: number;
  };
}

interface GuideProfileContentProps {
  currentUserId?: string
}

interface TourCardProps {
  tour: {
    _id: string;
    title: string;
    // Other required fields
  };
}

interface Review {
  _id: string;
  rating: number;
  message: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ReviewFormData {
  tourId: string;
  rating: number;
  message: string;
  guideId: string;
  tourStatus: string;
}

// This interface is for the props of AddReviewDialog itself, not for this component.
// If AddReviewDialog is imported, its props interface would come with it.
// For now, assuming AddReviewDialog's onSubmit prop expects ReviewFormData based on its own definition.
interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reviewData: ReviewFormData) => Promise<void>; // Changed to use ReviewFormData
  tourId: string;
  tourStatus: string;
}

export default function GuideProfileContent({
  currentUserId
}: GuideProfileContentProps) {
  const guide = useGuide();
  const guideId = guide.id;

  if (!guide) {
    return <div>Guide information not available</div>;
  }

  const [activeTab, setActiveTab] = useState("tours")
  const [activeTourTab, setActiveTourTab] = useState("active")
  const [addMemoryOpen, setAddMemoryOpen] = useState(false)
  const [addReviewOpen, setAddReviewOpen] = useState(false)
  const [selectedTourForAction, setSelectedTourForAction] = useState<Tour | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [guideReviews, setGuideReviews] = useState<Review[]>([]);
  const isOwnProfile = Boolean(currentUserId) && currentUserId === guide.id;

  const submitRating = async (reviewData: ReviewFormData): Promise<void> => {
    const { tourId, rating, message } = reviewData;
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/tour-reviews`, 
        { tourId, rating, message, guideId },
        { headers: getAuthHeader() }
      );
      
      await fetchReviews();
      toast.success('Review submitted successfully!');
    } catch (error: any) {
      console.error('Review submission failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Invalid review data');
        } else {
          toast.error(error.response?.data?.message || 'Failed to submit review');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  const fetchReviews = async () => {
    if (!selectedTour?._id) return;
    
    try {
      console.log('Fetching reviews for tour:', selectedTour._id);
      const response = await axios.get<Review[]>(`${API_BASE_URL}/api/tour-reviews/tour/${selectedTour._id}`);
      setReviews(response.data);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to load reviews');
      }
    }
  };

  const fetchGuideReviews = async () => {
    try {
      // Expected response shape
      interface GuideReviewsResponse {
        reviews: Review[];
      }

      const response = await axios.get<GuideReviewsResponse>(
        `${API_BASE_URL}/api/tour-reviews/guide/${guideId}`
      );

      setGuideReviews(response.data.reviews);
    } catch (error: any) {
      console.error('Erreur chargement avis guide:', error);
      toast.error('Échec chargement des avis');
    }
  };

  useEffect(() => {
    if (selectedTour) {
      fetchReviews();
    }
  }, [selectedTour]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchGuideReviews();
    }
  }, [activeTab]);

  const handleAddMemory = (tour: Tour) => {
    // Add memory logic here
  };

  // Verify if the current user actually participated in the tour before allowing review
  const verifyParticipation = async (tourId: string): Promise<boolean> => {
    if (!currentUserId) {
      toast.error('Vous devez être connecté pour laisser un avis');
      return false;
    }

    try {
      interface ParticipationResponse {
        participated: boolean;
      }

      const response = await axios.get<ParticipationResponse>(`${API_BASE_URL}/api/reservations/check-participation`, {
        params: {
          tourId,
          touristId: currentUserId,
        },
        headers: getAuthHeader(),
      });

      return response.data.participated;
    } catch (error: any) {
      console.error('Erreur de vérification de participation :', error);
      toast.error("Impossible de vérifier votre participation au tour");
      return false;
    }
  };

  const handleAddReview = async (tour: Tour) => {
    const participated = await verifyParticipation(tour._id);

    if (participated) {
      setSelectedTour(tour);
      setReviewDialogOpen(true);
    } else {
      toast.error('Seuls les participants peuvent ajouter un avis sur ce tour.');
    }
  };

  useEffect(() => {
  }, [reviewDialogOpen]);

  // Filter active tours (status = 'active')
  const displayedActiveTours = guide.activeTours.filter((tour: Tour) => tour.tourStatus === 'active');

  // Filter completed tours (status = 'completed')
  const displayedCompletedTours = guide.completedTours.filter((tour: Tour) => tour.tourStatus === 'completed');

  return (
    <>
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

        <TabsContent value="tours">
          <div className="space-y-6">
            <div className="flex gap-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTourTab("active")}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTourTab === "active"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Tours proposés ({displayedActiveTours.length})
              </button>
              <button
                onClick={() => setActiveTourTab("completed")}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTourTab === "completed"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Tours réalisés ({displayedCompletedTours.length})
              </button>
            </div>

            {activeTourTab === "active" && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedActiveTours.map((tour: Tour, index: number) => (
                  <GuideTourCard 
                    key={tour._id} 
                    tour={tour}
                    index={index}
                  />
                ))}
              </div>
            )}

            {activeTourTab === "completed" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedCompletedTours.map((tour: Tour, index: number) => (
                  <CompletedTourCard
                    key={tour._id}
                    tour={tour}
                    index={index}
                    onAddMemory={() => handleAddMemory(tour)}
                    onAddReview={() => handleAddReview(tour)}
                    isOwnProfile={isOwnProfile}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="memories">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">About</h2>          
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-4">
            {guideReviews.length > 0 ? (
              guideReviews.map((review) => (
                <div key={review._id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i} 
                        className={`h-5 w-5 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{review.message}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    - {review.user?.name || 'Anonyme'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                Aucun avis pour le moment
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AddMemoryDialog 
        open={addMemoryOpen} 
        onOpenChange={setAddMemoryOpen} 
      />
      <AddReviewDialog 
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onSubmit={submitRating}
        tourId={selectedTour?._id || ""}
        tourStatus={selectedTour?.tourStatus || ""}
      />
    </>
  );
}
