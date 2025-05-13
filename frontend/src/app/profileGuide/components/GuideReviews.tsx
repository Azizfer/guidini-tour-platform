"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageSquare } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// Données fictives pour les avis
const mockReviews = [
  {
    id: "1",
    touristId: "101",
    touristName: "John Smith",
    touristAvatar: "/placeholder.svg?height=40&width=40",
    tourId: "1",
    tourName: "Visite historique de la médina de Sousse",
    rating: 5,
    comment:
      "Ahmed était un guide exceptionnel ! Il était très cultivé sur l'histoire de la médina de Sousse et a rendu la visite captivante et amusante. Je recommande vivement !",
    date: "2023-06-15",
    reply: "Merci pour vos gentils mots, John ! Ce fut un plaisir de vous faire découvrir la médina de Sousse.",
  },
  {
    id: "2",
    touristId: "102",
    touristName: "Emma Johnson",
    touristAvatar: "/placeholder.svg?height=40&width=40",
    tourId: "2",
    tourName: "Visite du Ribat de Monastir et du Mausolée",
    rating: 4,
    comment:
      "Super visite de Monastir ! Ahmed a été très informatif et patient avec toutes nos questions. La seule raison pour laquelle je donne 4 étoiles au lieu de 5 est que nous avons eu l'impression d'être un peu pressés à la fin.",
    date: "2023-06-20",
    reply: null,
  },
  {
    id: "3",
    touristId: "103",
    touristName: "Michael Brown",
    touristAvatar: "/placeholder.svg?height=40&width=40",
    tourId: "1",
    tourName: "Visite historique de la médina de Sousse",
    rating: 5,
    comment:
      "En tant que professeur d'histoire, j'ai été impressionné par la profondeur des connaissances d'Ahmed sur la signification historique et culturelle de la médina de Sousse. Il a pu répondre à toutes mes questions et m'a fourni des informations fascinantes qu'on ne trouve pas dans les guides.",
    date: "2023-06-25",
    reply:
      "Merci, Professeur Brown ! J'ai apprécié nos discussions sur le contexte historique de la médina. Vos idées étaient également précieuses !",
  },
  {
    id: "4",
    touristId: "104",
    touristName: "Sarah Wilson",
    touristAvatar: "/placeholder.svg?height=40&width=40",
    tourId: "3",
    tourName: "Expérience de plage à Sousse",
    rating: 3,
    comment:
      "La plage était magnifique et Ahmed était sympathique, mais nous nous attendions à ce que plus d'activités soient incluses dans le prix. Dans l'ensemble, c'était correct, mais cela aurait pu être mieux organisé.",
    date: "2023-06-30",
    reply: null,
  },
]

export default function GuideReviews() {
  const [reviews, setReviews] = useState(mockReviews)
  const [replyText, setReplyText] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return

    setReviews(reviews.map((review) => (review.id === reviewId ? { ...review, reply: replyText } : review)))
    setReplyText("")
    setReplyingTo(null)
  }

  const calculateAverageRating = () => {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return (total / reviews.length).toFixed(1)
  }

  const getRatingCounts = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((review) => {
      counts[review.rating as keyof typeof counts]++
    })
    return counts
  }

  const ratingCounts = getRatingCounts()

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="md:col-span-1 border border-white/20 bg-white/90 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                Résumé des évaluations
              </CardTitle>
              <CardDescription>Basé sur {reviews.length} avis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
                  {calculateAverageRating()}
                </div>
                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(Number.parseFloat(calculateAverageRating()))
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center">
                      {rating} <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(ratingCounts[rating as keyof typeof ratingCounts] / reviews.length) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                    <div className="text-sm text-gray-600">{ratingCounts[rating as keyof typeof ratingCounts]}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="border border-white/20 bg-white/90 backdrop-blur-sm shadow-md">
            <CardHeader>
              <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                Avis récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="bg-white/20 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-md">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
                  >
                    Tous les avis
                  </TabsTrigger>
                  <TabsTrigger
                    value="5"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
                  >
                    5 étoiles
                  </TabsTrigger>
                  <TabsTrigger
                    value="4"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
                  >
                    4 étoiles
                  </TabsTrigger>
                  <TabsTrigger
                    value="3"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
                  >
                    3 étoiles
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
                  >
                    Réponse en attente
                  </TabsTrigger>
                </TabsList>
                <AnimatePresence mode="wait">
                  <TabsContent value="all" className="mt-6 space-y-6">
                    <motion.div variants={containerVariants}>
                      {reviews.map((review, index) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          onReply={() => setReplyingTo(review.id)}
                          isReplying={replyingTo === review.id}
                          replyText={replyText}
                          setReplyText={setReplyText}
                          handleReply={() => handleReply(review.id)}
                          index={index}
                        />
                      ))}
                    </motion.div>
                  </TabsContent>
                  {[5, 4, 3].map((rating) => (
                    <TabsContent key={rating} value={rating.toString()} className="mt-6 space-y-6">
                      <motion.div variants={containerVariants}>
                        {reviews
                          .filter((review) => review.rating === rating)
                          .map((review, index) => (
                            <ReviewCard
                              key={review.id}
                              review={review}
                              onReply={() => setReplyingTo(review.id)}
                              isReplying={replyingTo === review.id}
                              replyText={replyText}
                              setReplyText={setReplyText}
                              handleReply={() => handleReply(review.id)}
                              index={index}
                            />
                          ))}
                      </motion.div>
                    </TabsContent>
                  ))}
                  <TabsContent value="pending" className="mt-6 space-y-6">
                    <motion.div variants={containerVariants}>
                      {reviews
                        .filter((review) => !review.reply)
                        .map((review, index) => (
                          <ReviewCard
                            key={review.id}
                            review={review}
                            onReply={() => setReplyingTo(review.id)}
                            isReplying={replyingTo === review.id}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            handleReply={() => handleReply(review.id)}
                            index={index}
                          />
                        ))}
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

interface ReviewCardProps {
  review: {
    id: string
    touristId: string
    touristName: string
    touristAvatar: string
    tourId: string
    tourName: string
    rating: number
    comment: string
    date: string
    reply: string | null
  }
  onReply: () => void
  isReplying: boolean
  replyText: string
  setReplyText: (text: string) => void
  handleReply: () => void
  index: number
}

function ReviewCard({ review, onReply, isReplying, replyText, setReplyText, handleReply, index }: ReviewCardProps) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, delay: index * 0.1, ease: "easeOut" },
    },
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="mb-4">
      <Card className="border border-white/20 bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="border-2 border-white/50 shadow-sm">
              <AvatarImage src={review.touristAvatar || "/placeholder.svg"} alt={review.touristName} />
              <AvatarFallback className="bg-gradient-to-br from-teal-400 to-blue-500 text-white">
                {review.touristName.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-teal-600">{review.touristName}</h3>
                  <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm mt-2 text-gray-700">{review.comment}</p>
              <p className="text-xs text-gray-500 mt-1">Visite : {review.tourName}</p>

              {review.reply && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-4 pl-4 border-l-2 border-teal-200 bg-teal-50/50 p-3 rounded-r-md"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-teal-500" />
                    <h4 className="text-sm font-medium text-teal-600">Votre réponse :</h4>
                  </div>
                  <p className="text-sm text-gray-700">{review.reply}</p>
                </motion.div>
              )}

              {!review.reply && !isReplying && (
                <button
                  className="text-sm text-teal-500 hover:text-teal-600 mt-2 flex items-center gap-1"
                  onClick={onReply}
                >
                  <MessageSquare className="h-3 w-3" />
                  Répondre à cet avis
                </button>
              )}

              {isReplying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <Textarea
                    className="w-full p-2 text-sm border border-teal-200 bg-white/50 rounded-md focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                    rows={3}
                    placeholder="Écrivez votre réponse..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  ></Textarea>
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyText("")}
                      className="border-teal-200 hover:bg-teal-50 text-teal-600"
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleReply}
                      className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
                    >
                      Soumettre la réponse
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
