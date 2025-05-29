"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircleIcon, CalendarIcon, ClockIcon, MapPinIcon, UserIcon, StarIcon } from "@heroicons/react/24/outline"
import TourRating from "@/components/tour-rating"
import { Tour } from "@/services/toursService"
import axios from "axios"

// Use environment variable if available, otherwise fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function CompletedTours() {
  const { user } = useAuth()
  const [completedTours, setCompletedTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompletedTours = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        if (!token) {
          setError("Vous devez être connecté pour voir vos tours complétés")
          setLoading(false)
          return
        }
        
        // Fetch bookings for the current user
        const response = await axios.get(`${API_BASE_URL}/api/bookings/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        // Get tour IDs from bookings
        const tourIds = response.data.map((booking: any) => booking.tourId)
        
        // Fetch tour details for each booking
        const toursPromises = tourIds.map((id: string) => 
          axios.get(`${API_BASE_URL}/api/tours/${id}`)
        )
        
        const toursResponses = await Promise.all(toursPromises)
        const tours = toursResponses.map(res => res.data)
        
        // Filter only completed tours
        const completed = tours.filter((tour: Tour) => tour.isCompleted)
        setCompletedTours(completed)
      } catch (err) {
        console.error("Erreur lors de la récupération des tours complétés:", err)
        setError("Impossible de charger vos tours complétés. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchCompletedTours()
  }, [user])

  const handleRatingSubmitted = (tourId: string, rating: number) => {
    // Update the local state to reflect the new rating
    setCompletedTours(prev => 
      prev.map(tour => 
        (tour._id === tourId || tour.id === tourId) 
          ? { ...tour, userRating: rating } 
          : tour
      )
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-slate-500">Chargement de vos tours complétés...</p>
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

  if (completedTours.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-40 gap-2">
        <p className="text-slate-500">Vous n'avez pas encore de tours complétés</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Mes Tours Complétés</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedTours.map((tour) => (
          <Card key={tour._id || tour.id} className="overflow-hidden flex flex-col h-full">
            {tour.image && (
              <div className="relative w-full h-40 overflow-hidden">
                <img 
                  src={tour.image.startsWith('/') || tour.image.startsWith('http') ? tour.image : `/uploads/${tour.image}`} 
                  alt={tour.title} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-tour.jpg';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-blue-100 text-blue-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Complété
                  </span>
                </div>
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold text-slate-900">{tour.title}</CardTitle>
              <CardDescription className="text-slate-500">
                {tour.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-2 flex-grow space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-700">{tour.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-700">{tour.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-700">{tour.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-700">Max: {tour.maxParticipants} pers.</span>
                </div>
              </div>
              
              {tour.rating && (
                <div className="flex items-center gap-1 mt-2">
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                  <span className="text-slate-700">{tour.rating.toFixed(1)}</span>
                  <span className="text-slate-500 text-sm">({tour.reviewCount} avis)</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2 border-t border-slate-100">
              <TourRating 
                tourId={tour._id || tour.id || ""} 
                onRatingSubmitted={(rating) => handleRatingSubmitted(tour._id || tour.id || "", rating)}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
