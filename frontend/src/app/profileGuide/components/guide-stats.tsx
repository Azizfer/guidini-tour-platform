"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarIcon, CheckCircleIcon, UsersIcon } from "@heroicons/react/24/solid"
import axios from "axios"

// Use environment variable if available, otherwise fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface GuideStats {
  totalBookings: number;
  averageRating: number;
  completedTours: number;
  activeTours: number;
}

export default function GuideStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<GuideStats>({
    totalBookings: 0,
    averageRating: 0,
    completedTours: 0,
    activeTours: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGuideStats = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError("Vous devez être connecté pour voir vos statistiques")
        setLoading(false)
        return
      }
      
      // Fetch guide details including stats
      const response = await axios.get(`${API_BASE_URL}/api/guides/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      // Define a type for the API response
      interface GuideResponse {
        data: {
          stats?: {
            totalBookings?: number;
            averageRating?: number;
            completedTours?: number;
            activeTours?: number;
          }
        }
      }
      
      // Type the response
      const typedResponse = response as GuideResponse;
      
      if (typedResponse.data && typedResponse.data.stats) {
        // Explicitly type the response data
        const guideStats: GuideStats = {
          totalBookings: typedResponse.data.stats.totalBookings || 0,
          averageRating: typedResponse.data.stats.averageRating || 0,
          completedTours: typedResponse.data.stats.completedTours || 0,
          activeTours: typedResponse.data.stats.activeTours || 0
        }
        setStats(guideStats)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des statistiques:", err)
      setError("Impossible de charger vos statistiques. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchGuideStats()
    
    // Set up event listener for tour status changes
    const handleTourStatusChange = () => {
      console.log('Tour status changed, refreshing guide stats')
      fetchGuideStats()
    }
    
    window.addEventListener('tourStatusChanged', handleTourStatusChange)
    
    return () => {
      window.removeEventListener('tourStatusChanged', handleTourStatusChange)
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-slate-500">Chargement de vos statistiques...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
        <p>{error}</p>
      </div>
    )
  }

  // Function to render stars for the rating
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={`full-${i}`} className="h-5 w-5 text-yellow-500" />
      )
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="h-5 w-5 text-slate-200" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIcon className="h-5 w-5 text-yellow-500" />
          </div>
        </div>
      )
    }
    
    // Add empty stars to complete 5 stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-5 w-5 text-slate-200" />
      )
    }
    
    return stars
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      {/* Tours complétés card has been moved to dashboard-stats.tsx */}
    </div>
  )
}
