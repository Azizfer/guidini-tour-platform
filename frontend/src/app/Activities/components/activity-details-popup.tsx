"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, User } from "lucide-react"
import axios from "axios"
import { Tour } from "@/services/toursService"
import Image from "next/image"
import { getCachedUserById } from "@/services/userService"

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
    dates: string[]
    category: string
    guide?: string
    guideId?: string
  }
  isOpen: boolean
  onClose: () => void
}

export default function ActivityDetailsPopup({ activity, isOpen, onClose }: ActivityDetailsPopupProps) {
  const [guideName, setGuideName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch guide information when component mounts or activity changes
  useEffect(() => {
    const fetchGuideInfo = async () => {
      if (!activity.id) return;
      
      setIsLoading(true);
      
      try {
        // Simple approach: Just use the guide name from the activity if it exists
        if (activity.guide) {
          setGuideName(activity.guide);
          setIsLoading(false);
          return;
        }
        
        // Otherwise, try to get it from the guideId
        if (activity.guideId) {
          try {
            // Define the expected response type
            interface UserResponse {
              _id?: string;
              id?: string;
              name: string;
              email?: string;
              profilePicture?: string;
            }
            
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
            const response = await axios.get<UserResponse>(`${API_URL}/users/${activity.guideId}`);
            
            // Now TypeScript knows that response.data is of type UserResponse
            if (response.data && response.data.name) {
              setGuideName(response.data.name);
              return;
            }
          } catch (error) {
            console.error('Error fetching guide information:', error);
          }
        }
        
        // If we get here, we couldn't find a guide name
        setGuideName('Guide Professionnel');
      } catch (error) {
        console.error('Error in fetchGuideInfo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuideInfo();
  }, [activity.id, activity.guideId, activity.guide]);

  // Format price with proper spacing and currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-xl">
        <div className="relative h-48 w-full">
          <Image
            src={activity.image || "/placeholder.svg"}
            alt={activity.title}
            fill
            sizes="(max-width: 768px) 100vw, 550px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-white/90 text-zinc-800 dark:bg-zinc-800/90 dark:text-zinc-200 backdrop-blur-md"
            >
              {activity.category}
            </Badge>
          </div>
          
          <div className="absolute bottom-3 right-3">
            <div className="px-3 py-1.5 rounded-md text-sm font-medium bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white backdrop-blur-sm border-l-2 border-blue-500 transition-all duration-300">
              {formatPrice(activity.price)}
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {activity.title}
            </DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400">
              {activity.location}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span>Durée: {activity.duration}</span>
            </div>
            
            {activity.maxParticipants && (
              <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                <Users className="w-4 h-4 mr-2 text-blue-500" />
                <span>Max {activity.maxParticipants} participants</span>
              </div>
            )}
            
            {activity.dates && activity.dates.length > 0 && (
              <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                <span>Date: {formatDate(activity.dates[0])}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              <span>Lieu: {activity.location}</span>
            </div>
          </div>
          
          <div className="mt-5 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Description</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {activity.longDescription || activity.description}
            </p>
          </div>
          
          {/* Guide/Creator Information */}
          <div className="mt-5 border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-blue-500" />
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Guide</h4>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              {isLoading ? (
                <span className="inline-block w-24 h-4 bg-zinc-200 dark:bg-zinc-700 animate-pulse rounded"></span>
              ) : (
                guideName || activity.guide || "Guide Professionnel"
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
