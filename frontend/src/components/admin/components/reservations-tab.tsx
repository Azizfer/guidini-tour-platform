"use client"

interface Reservation {
  _id: string;
  touristName: string;
  touristEmail: string;
  touristProfileImage: string;
  guideId: string;
  guideName: string;
  tourName: string;
  tourTime: string;
  tourDuration: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface ApiResponse {
  reservations: Reservation[];
}

interface ReservationsTabProps {
  onNewCount?: (count: number) => void
}

import React from 'react'
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Download, Eye, Calendar, Clock, CheckCircle, XCircle, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"
import { useAuth } from "@/app/LogingContext/AuthContext"

export default function ReservationsTab({ onNewCount }: ReservationsTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Early return if user is not authenticated
  if (!user) {
    return (
      <div className="p-6 text-center text-red-600">
        Veuillez vous connecter pour accéder aux réservations
      </div>
    )
  }

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // Use the reservations endpoint
        const endpoint = '/api/reservations';

        const response = await axios.get<ApiResponse>(endpoint, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        setReservations(response.data.reservations);
        if (typeof window !== 'undefined' && onNewCount) {
          const lastVisited = parseInt(localStorage.getItem('admin_reservations_lastVisited') || '0')
          const newRes = response.data.reservations.filter((r: Reservation) => new Date(r.createdAt).getTime() > lastVisited).length
          onNewCount(newRes)
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching reservations:', err)
        setError('Erreur lors du chargement des réservations')
        toast({
          title: "Erreur",
          description: "Impossible de charger les réservations. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservations()
  }, [user, toast, onNewCount])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Annulée</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Terminée</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmée</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inconnu</Badge>
    }
  }

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Payé</Badge>
      case "refunded":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Remboursé</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Échoué</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>
      default:
        return null
    }
  }

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      (reservation.touristName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false) ||
      (reservation.tourName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false) ||
      (reservation._id?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false)
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Réservations</h2>
          <p className="text-gray-600 mt-1">Suivez toutes les réservations et paiements</p>
        </div>
    </div>



      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total des réservations</p>
                <p className="text-3xl font-bold text-gray-900">{reservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, activité ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Liste des Réservations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              {error}
            </div>
          ) : (
            <div className="space-y-0">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation._id}
                  className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={reservation.touristProfileImage || "/placeholder.svg"} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {reservation.touristName && 
                          reservation.touristName.split(" ")
                          .map((n) => n[0])
                          .join("") || "User"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{reservation.tourName}</h3>
                            <Badge variant="outline" className="text-xs">
                              {reservation._id}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Client: {reservation.touristName} • Guide: {reservation.guideName}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(reservation.date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {reservation.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{reservation.participants} participants</span>
                            </div>
                            <div className="flex items-center gap-1 font-medium text-green-600">
                              <span className="font-medium">TND</span>
                              {reservation.totalPrice.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 ml-4">
                          {getStatusBadge(reservation.status)}
                          {getPaymentBadge(reservation.paymentStatus)}
                        </div>
                      </div>

                      {reservation.status === "pending" && (
                        <div className="flex items-center gap-2 mt-4">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmer
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Annuler
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>


                </div>
              ))}
              

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}