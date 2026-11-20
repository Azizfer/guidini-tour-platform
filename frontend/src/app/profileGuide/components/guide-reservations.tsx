"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MapPinIcon, UserIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/app/LogingContext/AuthContext"

// Interface for reservation data
interface Reservation {
  id: string
  tourId: string
  tourName: string
  touristName: string
  touristEmail: string
  touristPhone: string
  date: string
  time: string
  participants: number
  totalPrice: number
  status: string
  createdAt: string
}

export default function GuideReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Function to fetch and process reservations
  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get the guide ID from localStorage or auth context
      const guideId = user?.id || localStorage.getItem("userId")

      if (!guideId) {
        setError("Aucun ID de guide trouvé. Veuillez vous reconnecter.")
        setLoading(false)
        return
      }

      // Fetch reservations for this guide
      let reservationData: any[] = []
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/guides/${guideId}/reservations`

        const token = localStorage.getItem("token")

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.warn(`Reservation API returned non-OK status: ${response.status}`)
        } else {
          reservationData = await response.json()
        }
      } catch (fetchError) {
        console.error("Error fetching reservations:", fetchError)
      }

      // Transform the data to match our interface
      const formattedReservations = reservationData.map((reservation: any) => ({
        id: reservation._id || reservation.id,
        tourId: reservation.tourId,
        tourName: reservation.tourName,
        touristName: reservation.touristName || "Client",
        touristEmail: reservation.touristEmail || "email@example.com",
        touristPhone: reservation.touristPhone || "+216 XX XXX XXX",
        date: reservation.date,
        time: reservation.time || "12:00",
        participants: reservation.participants || 1,
        totalPrice: reservation.totalPrice || 0,
        status: reservation.status || "confirmed",
        createdAt: reservation.createdAt,
      }))

      setReservations(formattedReservations)
    } catch (err: any) {
      console.error("Error fetching reservations:", err)
      setError(err.message || "Erreur lors de la récupération des réservations")
    } finally {
      setLoading(false)
    }
  }

  // Fetch reservations on component mount
  useEffect(() => {
    fetchReservations()
  }, [user])

  // Listen for reservation update events
  useEffect(() => {
    const handleReservationUpdate = (event: Event) => {
      fetchReservations()
    }

    window.addEventListener("reservationUpdate", handleReservationUpdate)
    window.addEventListener("notificationUpdate", handleReservationUpdate)

    return () => {
      window.removeEventListener("reservationUpdate", handleReservationUpdate)
      window.removeEventListener("notificationUpdate", handleReservationUpdate)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Réservations</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Tabs defaultValue="all" className="w-full">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600 rounded-md transition-all px-6"
              >
                Toutes les réservations
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="p-6 mt-0">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 ml-3">Chargement des réservations...</p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-40 gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-center">Aucune réservation trouvée</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onViewDetails={() => {
                      setSelectedReservation(reservation)
                      setIsDetailsOpen(true)
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedReservation && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Détails de la réservation</DialogTitle>
              <DialogDescription className="text-gray-600">
                Réservation pour {selectedReservation.tourName} le{" "}
                {new Date(selectedReservation.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Informations touriste</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Nom:</span> {selectedReservation.touristName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedReservation.touristEmail}
                    </p>
                    <p>
                      <span className="font-medium">Téléphone:</span> {selectedReservation.touristPhone}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Détails réservation</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(selectedReservation.date).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Heure:</span> {selectedReservation.time}
                    </p>
                    <p>
                      <span className="font-medium">Participants:</span> {selectedReservation.participants}
                    </p>
                    <p>
                      <span className="font-medium">Prix total:</span> {selectedReservation.totalPrice} TND
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                  onClick={() => setIsDetailsOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface ReservationCardProps {
  reservation: Reservation
  onViewDetails: () => void
}

function ReservationCard({ reservation, onViewDetails }: ReservationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "confirmed":
        return "Confirmée"
      case "completed":
        return "Terminée"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  return (
    <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{reservation.tourName}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1 text-gray-500">
              <CalendarIcon className="h-4 w-4" />
              {new Date(reservation.date).toLocaleDateString()} à {reservation.time}
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor(reservation.status)} border-0 font-medium`}>
            {getStatusText(reservation.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{reservation.touristName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{reservation.touristEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <PhoneIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{reservation.touristPhone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <MapPinIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {reservation.participants} participant{reservation.participants > 1 ? "s" : ""}
            </span>
          </div>
          <div className="font-semibold text-gray-900 text-lg">{reservation.totalPrice} TND</div>
        </div>
      </CardContent>
      <CardFooter className="pt-3 border-t border-gray-100">
        <Button
          variant="outline"
          className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 rounded-lg transition-all"
          onClick={onViewDetails}
        >
          Voir les détails
        </Button>
      </CardFooter>
    </Card>
  )
}
