"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  CalendarIcon,
  CheckIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/app/LogingContext/AuthContext"

// Interface for reservation data
interface Reservation {
  id: string;
  tourId: string;
  tourName: string;
  touristName: string;
  touristEmail: string;
  touristPhone: string;
  date: string;
  time: string;
  participants: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function GuideReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Function to fetch and process reservations
  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get the guide ID from localStorage or auth context
      const guideId = user?.id || localStorage.getItem('userId')
      
      if (!guideId) {
        setError('Aucun ID de guide trouvé. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }
      
      console.log('Fetching reservations for guide:', guideId)
      
      // Fetch reservations for this guide
      let reservationData: any[] = []
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/guides/${guideId}/reservations`
        console.log('Calling API URL:', apiUrl)
        
        const token = localStorage.getItem('token')
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        // Log response status for debugging
        console.log(`Reservation API response status: ${response.status}`)
        
        if (!response.ok) {
          console.warn(`Reservation API returned non-OK status: ${response.status}`)
          // Don't throw here, we'll continue with empty array
        } else {
          reservationData = await response.json()
          console.log(`Fetched ${reservationData.length} reservations from API`)
        }
      } catch (fetchError) {
        console.error('Error fetching reservations:', fetchError)
        // Continue with empty array
      }
      
      // Transform the data to match our interface
      const formattedReservations = reservationData.map((reservation: any) => {
        console.log('Processing reservation:', reservation);
        return {
          id: reservation._id || reservation.id,
          tourId: reservation.tourId,
          tourName: reservation.tourName,
          touristName: reservation.touristName || 'Client',
          touristEmail: reservation.touristEmail || 'email@example.com',
          touristPhone: reservation.touristPhone || '+216 XX XXX XXX',
          date: reservation.date,
          time: reservation.time || '12:00',
          participants: reservation.participants || 1,
          totalPrice: reservation.totalPrice || 0,
          status: reservation.status || 'confirmed',
          createdAt: reservation.createdAt
        };
      });
      
      setReservations(formattedReservations)
    } catch (err: any) {
      console.error('Error fetching reservations:', err)
      setError(err.message || 'Erreur lors de la récupération des réservations')
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
    // Create a handler for the custom reservation update event
    const handleReservationUpdate = (event: Event) => {
      console.log('Reservation update event received, refreshing reservations')
      fetchReservations()
    }
    
    // Add event listener for reservation updates
    window.addEventListener('reservationUpdate', handleReservationUpdate)
    
    // Also listen for notification updates as they might indicate new reservations
    window.addEventListener('notificationUpdate', handleReservationUpdate)
    
    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('reservationUpdate', handleReservationUpdate)
      window.removeEventListener('notificationUpdate', handleReservationUpdate)
    }
  }, [])

  const sendResponse = () => {
    // Dans une vraie application, cela enverrait un message au touriste
    console.log(`Message envoyé à ${selectedReservation?.touristName}: ${responseMessage}`)
    setResponseMessage("")
    setIsDetailsOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">Réservations</h2>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start mb-6 bg-slate-100">
          <TabsTrigger value="all" className="flex-1">
            Toutes les réservations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
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
        </TabsContent>
      </Tabs>

      {selectedReservation && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Détails de la réservation</DialogTitle>
              <DialogDescription className="text-slate-500">
                Réservation pour {selectedReservation.tourName} le{" "}
                {new Date(selectedReservation.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700">Informations sur le touriste</h3>
                  <p className="text-sm text-slate-600">{selectedReservation.touristName}</p>
                  <p className="text-sm text-slate-600">{selectedReservation.touristEmail}</p>
                  <p className="text-sm text-slate-600">{selectedReservation.touristPhone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-700">Détails de la réservation</h3>
                  <p className="text-sm text-slate-600">
                    Date : {new Date(selectedReservation.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-600">Heure : {selectedReservation.time}</p>
                  <p className="text-sm text-slate-600">Participants : {selectedReservation.participants}</p>
                  <p className="text-sm text-slate-600">Prix total : {selectedReservation.totalPrice} TND</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  onClick={() => setIsDetailsOpen(false)}
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
  reservation: Reservation;
  onViewDetails: () => void;
}

function ReservationCard({ reservation, onViewDetails }: ReservationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-slate-500"
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
    <Card className="border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-slate-900">{reservation.tourName}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <CalendarIcon className="h-4 w-4" />
              {new Date(reservation.date).toLocaleDateString()} à {reservation.time}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(reservation.status)}>{getStatusText(reservation.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-700">
            <UserIcon className="h-4 w-4 text-slate-500" />
            <span>{reservation.touristName}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <MapPinIcon className="h-4 w-4 text-slate-500" />
            <span>{reservation.participants} participants</span>
          </div>
          <div className="font-medium text-slate-700">Total : {reservation.totalPrice} TND</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full hover:bg-blue-50 hover:text-blue-600" onClick={onViewDetails}>
          Voir les détails
        </Button>
      </CardFooter>
    </Card>
  )
}
