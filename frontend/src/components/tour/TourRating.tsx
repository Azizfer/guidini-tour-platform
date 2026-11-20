"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import axios from 'axios'
import { useToast } from '@/components/ui/use-toast'

interface TourRatingProps {
  tourId: string
  isCompleted: boolean
  onRatingSubmitted?: () => void
}

export default function TourRating({ 
  tourId, 
  isCompleted,
  onRatingSubmitted
}: TourRatingProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const { toast } = useToast()

  const handleSubmitRating = async () => {
    if (!isCompleted) {
      toast({
        title: "Tour non complété",
        description: "Vous ne pouvez noter que des tours qui ont été complétés",
        variant: "destructive"
      })
      return
    }
    
    if (rating === 0) {
      toast({
        title: "Note requise",
        description: "Veuillez sélectionner une note avant de soumettre",
        variant: "destructive"
      })
      return
    }
    
    try {
      setLoading(true)
      
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour noter ce tour",
          variant: "destructive"
        })
        return
      }
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
      
      const response = await axios.post(
        `${API_URL}/tour-reviews`,
        {
          tourId,
          rating
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.status === 201) {
        toast({
          title: "Note soumise",
          description: "Votre note a été soumise avec succès",
          variant: "default"
        })
        
        setHasRated(true)
        if (onRatingSubmitted) {
          onRatingSubmitted()
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la soumission de la note:', error)
      
      if (error.response?.status === 400 && error.response?.data?.message?.includes('déjà laissé un avis')) {
        toast({
          title: "Note déjà soumise",
          description: "Vous avez déjà noté ce tour",
          variant: "destructive"
        })
        setHasRated(true)
      } else {
        toast({
          title: "Erreur",
          description: error.response?.data?.message || "Une erreur est survenue lors de la soumission de votre note",
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }
  
  if (hasRated) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Votre note</h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-6 w-6 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">Merci pour votre évaluation!</p>
      </div>
    )
  }
  
  if (!isCompleted) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Évaluation</h3>
        <p className="text-sm text-gray-600">
          Ce tour n'est pas encore marqué comme complété. Vous pourrez le noter une fois qu'il sera complété.
        </p>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center gap-2 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Évaluer ce tour</h3>
      
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-6 w-6 cursor-pointer ${
              star <= (hoveredRating || rating) 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-300'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
          />
        ))}
      </div>
      
      <Button 
        onClick={handleSubmitRating} 
        disabled={loading || rating === 0}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {loading ? "Soumission en cours..." : "Soumettre ma note"}
      </Button>
    </div>
  )
}
