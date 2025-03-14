"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
];

export default function GuideReviews() {
  const [reviews, setReviews] = useState(mockReviews);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return;

    setReviews(reviews.map((review) => (review.id === reviewId ? { ...review, reply: replyText } : review)));
    setReplyText("");
    setReplyingTo(null);
  };

  const calculateAverageRating = () => {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingCounts = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      counts[review.rating as keyof typeof counts]++;
    });
    return counts;
  };

  const ratingCounts = getRatingCounts();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Résumé des évaluations</CardTitle>
            <CardDescription>Basé sur {reviews.length} avis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold">{calculateAverageRating()}</div>
              <div className="flex items-center mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(Number.parseFloat(calculateAverageRating()))
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground"
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
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${(ratingCounts[rating as keyof typeof ratingCounts] / reviews.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ratingCounts[rating as keyof typeof ratingCounts]}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Avis récents</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Tous les avis</TabsTrigger>
                <TabsTrigger value="5">5 étoiles</TabsTrigger>
                <TabsTrigger value="4">4 étoiles</TabsTrigger>
                <TabsTrigger value="3">3 étoiles</TabsTrigger>
                <TabsTrigger value="pending">Réponse en attente</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-6 space-y-6">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onReply={() => setReplyingTo(review.id)}
                    isReplying={replyingTo === review.id}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    handleReply={() => handleReply(review.id)}
                  />
                ))}
              </TabsContent>
              {[5, 4, 3].map((rating) => (
                <TabsContent key={rating} value={rating.toString()} className="mt-6 space-y-6">
                  {reviews
                    .filter((review) => review.rating === rating)
                    .map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onReply={() => setReplyingTo(review.id)}
                        isReplying={replyingTo === review.id}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        handleReply={() => handleReply(review.id)}
                      />
                    ))}
                </TabsContent>
              ))}
              <TabsContent value="pending" className="mt-6 space-y-6">
                {reviews
                  .filter((review) => !review.reply)
                  .map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onReply={() => setReplyingTo(review.id)}
                      isReplying={replyingTo === review.id}
                      replyText={replyText}
                      setReplyText={setReplyText}
                      handleReply={() => handleReply(review.id)}
                    />
                  ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ReviewCardProps {
  review: {
    id: string;
    touristId: string;
    touristName: string;
    touristAvatar: string;
    tourId: string;
    tourName: string;
    rating: number;
    comment: string;
    date: string;
    reply: string | null;
  };
  onReply: () => void;
  isReplying: boolean;
  replyText: string;
  setReplyText: (text: string) => void;
  handleReply: () => void;
}

function ReviewCard({ review, onReply, isReplying, replyText, setReplyText, handleReply }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={review.touristAvatar} alt={review.touristName} />
            <AvatarFallback>{review.touristName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{review.touristName}</h3>
                <p className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm mt-2">{review.comment}</p>
            <p className="text-xs text-muted-foreground mt-1">Visite : {review.tourName}</p>

            {review.reply && (
              <div className="mt-4 pl-4 border-l-2 border-muted">
                <h4 className="text-sm font-medium">Votre réponse :</h4>
                <p className="text-sm mt-1">{review.reply}</p>
              </div>
            )}

            {!review.reply && !isReplying && (
              <button className="text-sm text-primary mt-2" onClick={onReply}>
                Répondre à cet avis
              </button>
            )}

            {isReplying && (
              <div className="mt-4">
                <textarea
                  className="w-full p-2 text-sm border rounded-md"
                  rows={3}
                  placeholder="Écrivez votre réponse..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-2 mt-2">
                  <button className="px-3 py-1 text-sm bg-muted rounded-md" onClick={() => setReplyText("")}>
                    Annuler
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md"
                    onClick={handleReply}
                  >
                    Soumettre la réponse
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}