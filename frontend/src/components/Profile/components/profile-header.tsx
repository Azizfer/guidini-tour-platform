"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import axios from 'axios';
import { useState, useEffect } from 'react';

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  userType: "guide" | "tourist"
  location: string
  bio: string
  description?: string
  joinedDate: string
  createdAt: string
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
  stats?: {
    activeTours: number;
    completedTours: number;
    rating: number;
    reviewCount: number;
  };
  profileImage?: string;
}

interface GuideStatsResponse {
  rating: number;
  reviewCount: number;
  // Add other stats fields if needed
}

interface GuideResponse {
  rating: number;
  reviewCount: number;
}

interface ProfileHeaderProps {
  profile: UserProfile
  isOwnProfile: boolean
  isFollowing: boolean
  onFollow: () => void
}

const safeParseDate = (raw: unknown): Date | null => {
  if (!raw) return null;
  const date = new Date(raw as any);
  return isNaN(date.getTime()) ? null : date;
};

export default function ProfileHeader({ profile, isOwnProfile, isFollowing, onFollow }: ProfileHeaderProps) {
  const [currentRating, setCurrentRating] = useState(profile.rating || 0);
  const [currentReviewCount, setCurrentReviewCount] = useState(profile.reviewCount || 0);

  useEffect(() => {
    const fetchGuideStats = async () => {
      try {
        if (profile.userType === 'guide') {
          const response = await axios.get<GuideResponse>(`/api/guides/${profile.id}`);
          setCurrentRating(response.data.rating || 0);
          setCurrentReviewCount(response.data.reviewCount || 0);
        }
      } catch (error) {
        console.error('Failed to fetch guide data:', error);
      }
    };
    
    fetchGuideStats();
  }, [profile.id, profile.userType]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5">
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Avatar className="h-20 w-20 border-4 border-white shadow-lg ring-2 ring-blue-100">
                <AvatarImage src={profile.avatar || profile.profileImage || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg font-bold">
                  {profile.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>

                  {/* Add back the contact button */}
                  {!isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full px-3 py-1 text-xs"
                    >
                      Contacter
                    </Button>
                  )}

                  {/* Badge after contact button */}
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium ${
                      profile.userType === "guide"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}
                  >
                    {profile.userType === "guide" ? "Guide Certifié" : "Voyageur"}
                  </Badge>
                </div>

                <p className="text-gray-500 text-sm">
                  {(() => {
                    const dateStr = profile.createdAt || profile.joinedDate;
                    if (!dateStr) return "Date d'inscription non disponible";
                    const parsed = safeParseDate(dateStr);
                    if (!parsed) return "Date d'inscription non disponible";
                    return `Membre depuis ${parsed.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}`;
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            {profile.userType === "guide" && profile.stats ? (
              <>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profile.stats.activeTours}</div>
                  <div className="text-xs text-gray-600">Tours proposés</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profile.stats.completedTours}</div>
                  <div className="text-xs text-gray-600">Tours réalisés</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <StarIconSolid className="h-4 w-4 text-blue-500" />
                    <span className="text-xl font-bold text-gray-900">
                      {(profile.stats.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {profile.stats.reviewCount || 0} avis
                  </div>
                </div>
              </>
            ) : profile.userType === "guide" ? (
              <>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profile.toursCount}</div>
                  <div className="text-xs text-gray-600">Tours proposés</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profile.completedTours}</div>
                  <div className="text-xs text-gray-600">Tours réalisés</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <StarIconSolid className="h-4 w-4 text-blue-500" />
                    <span className="text-xl font-bold text-gray-900">
                      {(profile.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {profile.reviewCount || 0} avis
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profile.tripsCount}</div>
                  <div className="text-xs text-gray-600">Voyages</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profile.reviewsGiven}</div>
                  <div className="text-xs text-gray-600">Avis donnés</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{profile.favoriteDestinations?.length}</div>
                  <div className="text-xs text-gray-600">Destinations favorites</div>
                </div>
              </>
            )}
          </div>

          {/* Bio */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {profile.bio || profile.description || "No bio provided"}
            </p>
          </div>

          {/* Languages and Expertise for Guide / Travel Style for Tourist */}
          {profile.userType === "guide" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  🌍 Langues parlées
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages?.map((lang, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 px-2.5 py-0.5 text-xs rounded-full"
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  🏆 Domaines d'expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise?.map((exp, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-200 px-2.5 py-0.5 text-xs rounded-full"
                    >
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  ✈️ Destinations favorites
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.favoriteDestinations?.map((dest, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 px-2.5 py-0.5 text-xs rounded-full"
                    >
                      {dest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  🎯 Style de voyage
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.travelStyle?.map((style, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-200 px-2.5 py-0.5 text-xs rounded-full"
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
