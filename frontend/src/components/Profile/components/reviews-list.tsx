"use client"

import { motion } from "framer-motion"
import { StarIcon } from "@heroicons/react/24/outline"

interface ReviewsListProps {
  isTourist?: boolean
}

export default function ReviewsList({ isTourist = false }: ReviewsListProps) {
  const reviews = [
    {
      id: "1",
      rating: 5,
      comment: isTourist
        ? "Guide exceptionnel ! Ahmed connaît parfaitement l'histoire de Sousse et sait la raconter de manière captivante. Une expérience inoubliable !"
        : "Guide exceptionnel ! Ahmed connaît parfaitement l'histoire de Sousse et sait la raconter de manière captivante. Une expérience inoubliable !",
      date: "2024-01-20",
      tourName: "Visite historique de la Médina",
      reviewerName: isTourist ? "Ahmed Ben Salem" : "Marie Dubois",
      reviewerAvatar: "/placeholder.svg?height=40&width=40",
      guideResponse: !isTourist
        ? "Merci beaucoup Marie ! C'était un plaisir de vous faire découvrir notre belle ville."
        : undefined,
    },
    {
      id: "2",
      rating: 5,
      comment: "Une expérience inoubliable. Très professionnel et passionné. Je recommande vivement !",
      date: "2024-01-18",
      tourName: "Tour gastronomique",
      reviewerName: isTourist ? "Fatma Trabelsi" : "John Smith",
      reviewerAvatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-start gap-4">
            <img
              src={review.reviewerAvatar || "/placeholder.svg"}
              alt={review.reviewerName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h4 className="font-semibold text-gray-900">
                  {isTourist ? `Guide: ${review.reviewerName}` : review.reviewerName}
                </h4>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
              {review.guideResponse && !isTourist && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-3 rounded-r-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Réponse du guide:</span> {review.guideResponse}
                  </p>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                <span>{new Date(review.date).toLocaleDateString("fr-FR")}</span>
                {review.tourName && <span>• {review.tourName}</span>}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
