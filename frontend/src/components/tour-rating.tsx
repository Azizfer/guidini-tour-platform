"use client"

import { useState, useEffect } from "react"
import { StarIcon } from "@heroicons/react/24/solid"
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { addRating, getUserTourRating } from "@/services/ratingService"

interface TourRatingProps {
  tourId: string
  onRatingSubmitted?: (rating: number) => void
}

export default function TourRating({ tourId, onRatingSubmitted }: TourRatingProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { toast } = useToast()

  // Fetch user's existing rating for this tour
  useEffect(() => {
    const fetchUserRating = async () => {
      try {
        setIsLoading(true)
        const existingRating = await getUserTourRating(tourId)
        
        if (existingRating) {
          setUserRating(existingRating.rating)
          setRating(existingRating.rating)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la note:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (tourId) {
      fetchUserRating()
    }
  }, [tourId])

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une note avant de soumettre",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await addRating(tourId, rating)
      
      if (response) {
        setUserRating(rating)
        
        toast({
          title: "Note soumise",
          description: "Merci pour votre évaluation !",
          variant: "default",
        })
        
        if (onRatingSubmitted) {
          onRatingSubmitted(rating)
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de soumettre votre note. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <p className="text-slate-500">Chargement...</p>
      </div>
    )
  }

  if (userRating) {
    return (
      <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
        <p className="text-slate-700 mb-2">Votre note</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`h-6 w-6 ${
                star <= userRating ? "text-yellow-500" : "text-slate-300"
              }`}
            />
          ))}
        </div>
        <p className="text-slate-500 text-sm mt-2">
          Merci pour votre évaluation !
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg">
      <p className="text-slate-700 mb-2">Évaluez ce tour</p>
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none"
          >
            {star <= (hoveredRating || rating) ? (
              <StarIcon className="h-8 w-8 text-yellow-500" />
            ) : (
              <StarOutlineIcon className="h-8 w-8 text-slate-400" />
            )}
          </button>
        ))}
      </div>
      <Button
        onClick={handleRatingSubmit}
        disabled={rating === 0 || isSubmitting}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isSubmitting ? "Envoi en cours..." : "Soumettre"}
      </Button>
    </div>
  )
}
