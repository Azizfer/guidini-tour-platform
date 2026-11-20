"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { StarIcon } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import { useGuide } from '@/contexts/GuideContext';

export interface ReviewFormData {
  tourId: string;
  rating: number;
  message: string;
  tourStatus: string;
}

interface AddReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  tourId: string;
  tourStatus: string;
}

export default function AddReviewDialog({
  open,
  onOpenChange,
  onSubmit,
  tourId,
  tourStatus
}: AddReviewDialogProps) {
  const guide = useGuide();
  
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!guide) {
      console.error('Missing guide ID:', { guide });
      alert('Données incomplètes - veuillez réessayer');
      onOpenChange(false);
    }
  }, [guide, onOpenChange]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        tourId,
        rating,
        message: comment,
        tourStatus
      });
      setRating(0);
      setComment('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error instanceof Error) {
        alert(`Erreur: ${error.message}`);
      } else {
        alert('Erreur inconnue lors de la soumission');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Évaluer votre expérience
          </DialogTitle>
          <DialogDescription>
            Donnez une note et partagez votre expérience sur ce tour
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Votre note</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  {star <= (hoveredRating || rating) ? (
                    <StarIconSolid className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-8 w-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {rating === 1 && "Très décevant"}
                {rating === 2 && "Décevant"}
                {rating === 3 && "Correct"}
                {rating === 4 && "Très bien"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm font-medium text-gray-700 mb-3 block">
              Votre avis
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec les autres voyageurs..."
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || comment.trim().length === 0 || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Publier l'avis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
