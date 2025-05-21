"use client"

import { useState } from "react"
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

// Données fictives pour les réservations
const mockReservations = [
  {
    id: "1",
    tourId: "1",
    tourName: "Visite historique de la médina de Sousse",
    touristName: "John Smith",
    touristEmail: "john@example.com",
    touristPhone: "+216 12 345 678",
    date: "2023-07-15",
    time: "09:00",
    participants: 2,
    totalPrice: 90,
    status: "pending", // en attente, confirmé, terminé, annulé
    notes: "Je suis intéressé par les aspects historiques de la médina.",
    createdAt: "2023-07-01",
  },
  {
    id: "2",
    tourId: "2",
    tourName: "Visite du Ribat de Monastir et du Mausolée",
    touristName: "Emma Johnson",
    touristEmail: "emma@example.com",
    touristPhone: "+216 98 765 432",
    date: "2023-07-20",
    time: "10:00",
    participants: 3,
    totalPrice: 165,
    status: "confirmed",
    notes: "Nous sommes une famille de 3, dont un enfant de 10 ans.",
    createdAt: "2023-07-05",
  },
  {
    id: "3",
    tourId: "1",
    tourName: "Visite historique de la médina de Sousse",
    touristName: "Michael Brown",
    touristEmail: "michael@example.com",
    touristPhone: "+216 55 555 555",
    date: "2023-07-18",
    time: "14:00",
    participants: 1,
    totalPrice: 45,
    status: "completed",
    notes: "Je suis professeur d'histoire intéressé par l'architecture islamique.",
    createdAt: "2023-07-02",
  },
  {
    id: "4",
    tourId: "3",
    tourName: "Expérience de plage à Sousse",
    touristName: "Sarah Wilson",
    touristEmail: "sarah@example.com",
    touristPhone: "+216 44 444 444",
    date: "2023-07-25",
    time: "08:30",
    participants: 4,
    totalPrice: 260,
    status: "cancelled",
    notes: "Nous attendons des activités nautiques.",
    createdAt: "2023-07-10",
  },
]

export default function GuideReservations() {
  const [reservations, setReservations] = useState(mockReservations)
  const [selectedReservation, setSelectedReservation] = useState<(typeof mockReservations)[0] | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")

  const updateReservationStatus = (id: string, status: string) => {
    setReservations(
      reservations.map((reservation) => (reservation.id === id ? { ...reservation, status } : reservation)),
    )
    setIsDetailsOpen(false)
  }

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
          <TabsTrigger value="pending" className="flex-1">
            En attente
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="flex-1">
            Confirmées
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Terminées
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1">
            Annulées
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
        {["pending", "confirmed", "completed", "cancelled"].map((status) => (
          <TabsContent key={status} value={status} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservations
                .filter((reservation) => reservation.status === status)
                .map((reservation) => (
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
        ))}
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
              <div>
                <h3 className="text-sm font-medium text-slate-700">Notes du touriste</h3>
                <p className="text-sm bg-slate-100 p-2 rounded-md mt-1 text-slate-600">{selectedReservation.notes}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-700">Répondre au touriste</h3>
                <Textarea
                  placeholder="Tapez votre message ici..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              {selectedReservation.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => updateReservationStatus(selectedReservation.id, "confirmed")}
                  >
                    <CheckIcon className="h-4 w-4" />
                    Confirmer
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={() => updateReservationStatus(selectedReservation.id, "cancelled")}
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Annuler
                  </Button>
                </>
              )}
              {selectedReservation.status === "confirmed" && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => updateReservationStatus(selectedReservation.id, "completed")}
                >
                  <CheckIcon className="h-4 w-4" />
                  Marquer comme terminé
                </Button>
              )}
              <Button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0"
                onClick={sendResponse}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                Envoyer le message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface ReservationCardProps {
  reservation: {
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
    notes: string
    createdAt: string
  }
  onViewDetails: () => void
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
