"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, User, Mail, X, Star } from "lucide-react"
import { Tour } from "@/services/toursService"
import { getCachedUserById } from "@/services/userService"
import { Button } from "@/components/ui/button"
import { useChat } from "@/contexts/chat-context"
import axios from 'axios'

interface ActivityDetailsPopupProps {
  activity: {
    id: string | number
    title: string
    description: string
    longDescription?: string
    image: string
    price: number
    duration: string
    maxParticipants?: number
    location: string
    dates: (string | Date)[]
    category: string
    guide?: {
      _id?: string
      id?: string
      name?: string
      profilePicture?: string
      profileImage?: string
    } | null
    guideName?: string
    guideId?: string
    rating?: number
    reviewCount?: number
  }
  isOpen: boolean
  onClose: () => void
}

export default function ActivityDetailsPopup({ activity, isOpen, onClose }: ActivityDetailsPopupProps) {
  const [guideName, setGuideName] = useState<string>('Guide Professionnel');
  const [guideId, setGuideId] = useState<string>("");
  const [guideImage, setGuideImage] = useState<string>("");
  const { openChat, refreshConversations } = useChat();
  
  // State initialization
  
  // Define interface for guide data to fix TypeScript errors
  interface GuideData {
    _id?: string;
    id?: string;
    name?: string;
    profilePicture?: string;
    profileImage?: string;
    email?: string;
  }

  // Fetch guide information when component mounts or activity changes
  useEffect(() => {
    const fetchGuideInfo = async () => {
      if (!activity.id) {
        console.log('No activity ID, skipping guide fetch');
        return;
      }
      
      console.log('Activity data received:', {
        id: activity.id,
        guideId: activity.guideId,
        guideName: activity.guideName,
        guide: activity.guide,
        title: activity.title
      });
      
      try {
        // APPROACH 1: If we have guideName directly, use it
        if (activity.guideName && activity.guideName !== '' && activity.guideName !== 'Guide Professionnel') {
          console.log('Using guideName directly:', activity.guideName);
          setGuideName(activity.guideName);
          if (activity.guideId) {
            console.log('Setting guideId from activity:', activity.guideId);
            setGuideId(activity.guideId);
          }
          return;
        }
        
        // APPROACH 2: If the activity has a guide object, try to use that first
        if (activity.guide && typeof activity.guide === 'object' && activity.guide !== null) {
          const guideObj = activity.guide as GuideData;
          console.log('Guide object from activity:', guideObj);
          
          if (guideObj.name) {
            console.log('Using guide object directly:', guideObj.name);
            setGuideName(guideObj.name);
            setGuideId(guideObj._id || guideObj.id || '');
            setGuideImage(guideObj.profilePicture || guideObj.profileImage || 
              `/placeholder.svg?height=400&width=400&text=${guideObj.name.charAt(0)}`);
            return;
          }
        }
        
        // APPROACH 3: Try to get guide info from guideId using the cached service
        if (activity.guideId) {
          console.log('Fetching guide info for ID:', activity.guideId);
          try {
            // First try the direct guide API
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            console.log('Fetching guide data from API:', `${apiUrl}/api/users/guides/${activity.guideId}`);
            
            try {
              const response = await axios.get<GuideData>(`${apiUrl}/api/users/guides/${activity.guideId}`);
              
              if (response.status === 200) {
                const guideData: GuideData = response.data;
                console.log('Direct API guide data:', guideData);
                
                if (guideData && guideData.name) {
                  console.log('Found guide name from direct API:', guideData.name);
                  setGuideName(guideData.name);
                  setGuideId(activity.guideId);
                  setGuideImage(guideData.profilePicture || guideData.profileImage || 
                    `/placeholder.svg?height=400&width=400&text=${guideData.name.charAt(0)}`);
                  return;
                }
              }
            } catch (directApiError) {
              console.error('Error fetching from direct API:', directApiError);
            }
            
            // Then try the cached service as fallback
            const guideData = await getCachedUserById(activity.guideId);
            console.log('Cached guide data response:', guideData);
            
            if (guideData && guideData.name) {
              console.log('Found guide data from cache:', guideData.name);
              setGuideName(guideData.name);
              setGuideId(guideData._id || guideData.id || activity.guideId);
              setGuideImage(guideData.profilePicture || `/placeholder.svg?height=400&width=400&text=${guideData.name.charAt(0)}`);
              return;
            } else {
              console.log('Guide data missing or incomplete:', guideData);
            }
          } catch (fetchError) {
            console.error('Error fetching guide data:', fetchError);
          }
        } else {
          console.log('No guideId available in activity');
        }
        
        // APPROACH 4: If the guide is a string ID, try to fetch it
        if (typeof activity.guide === 'string') {
          console.log('Guide is a string ID:', activity.guide);
          try {
            const guideData = await getCachedUserById(activity.guide);
            console.log('Fetched guide data from string ID:', guideData);
            
            if (guideData && guideData.name) {
              setGuideName(guideData.name);
              setGuideId(guideData._id || guideData.id || activity.guide);
              setGuideImage(guideData.profilePicture || `/placeholder.svg?height=400&width=400&text=${guideData.name.charAt(0)}`);
              return;
            }
          } catch (fetchError) {
            console.error('Error fetching guide from string ID:', fetchError);
          }
        }
        
        // Fallback to default guide name
        console.log('Fallback to default guide name');
        setGuideName('Guide Professionnel');
        // If we have a guideId but couldn't get a name, still set the ID for contact functionality
        if (activity.guideId) {
          setGuideId(activity.guideId);
        }
      } catch (error) {
        console.error('Error in fetchGuideInfo:', error);
      }
    };

    fetchGuideInfo();
  }, [activity.id, activity.guideId, activity.guideName, activity.guide]);

  const handleContactGuide = () => {
    if (!guideId) {
      console.error('Cannot contact guide: No guide ID available');
      return;
    }
    
    console.log('Opening chat with guide:', {
      guideId,
      guideName
    });
    
    // Open chat with the guide using the expected ChatUser format
    openChat({
      id: guideId,
      name: guideName,
      avatar: guideImage || `/placeholder.svg?height=400&width=400&text=${guideName.charAt(0)}`
    });
    
    // Refresh conversations to ensure the new chat appears
    refreshConversations().catch(error => {
      console.log('Background refresh error:', error);
    });
    
    // Close the popup after opening chat
    onClose();
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  const formatPrice = (price: number) => {
    // Format without currency symbol first
    const formattedNumber = new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    
    // Then add the currency symbol manually
    return `${formattedNumber} DT`;
  }

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => onClose()}>
      <div 
        className="bg-white sm:max-w-[480px] w-full overflow-hidden rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >


        {/* Image header */}
        <div className="relative h-44 w-full">
          <img
            src={activity.image || "/images/placeholder-activity.jpg"}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute top-2 left-2">
            <Badge className="bg-white/90 text-zinc-800 hover:bg-white transition-colors backdrop-blur-md">
              {activity.category}
            </Badge>
          </div>
          
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-white text-xl font-bold drop-shadow-md">{activity.title}</h2>
          </div>
          
          {/* Close button */}
          <button
            type="button"
            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-gray-800 transition-colors z-10 shadow-sm"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {/* Price and details section */}
          <div className="flex flex-col gap-3 mb-4 border-b border-gray-100 pb-4">
            <div className="flex items-center">
              <span className="font-bold text-xl text-gray-900">{formatPrice(activity.price)}</span>
              <span className="text-xs text-gray-600 ml-1">/personne</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-sm text-gray-700">
                <Clock className="h-4 w-4 mr-1.5 text-blue-600" />
                <span>{activity.duration}</span>
              </div>
              
              {activity.maxParticipants && (
                <div className="flex items-center text-sm text-gray-700">
                  <Users className="h-4 w-4 mr-1.5 text-blue-600" />
                  <span>Max {activity.maxParticipants} personnes</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Location and date */}
          <div className="flex flex-wrap gap-4 mb-4 border-b border-gray-100 pb-4">
            <div className="flex items-center text-sm text-gray-700">
              <MapPin className="h-4 w-4 mr-1.5 text-blue-600" />
              <span>{activity.location}</span>
            </div>
            
            {activity.dates && activity.dates.length > 0 && (
              <div className="flex items-center text-sm text-gray-700">
                <Calendar className="h-4 w-4 mr-1.5 text-blue-600" />
                <span>{formatDate(activity.dates[0])}</span>
              </div>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{activity.description}</p>
          </div>
          
          {/* Guide info */}
          <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mr-3">
                {guideImage ? (
                  <img src={guideImage} alt={guideName} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{guideName}</p>
                <p className="text-xs text-gray-500">Guide professionnel</p>
              </div>
            </div>
            
            {guideId && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={handleContactGuide}
              >
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                Contacter
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
