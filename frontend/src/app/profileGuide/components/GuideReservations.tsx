"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, MapPin, MessageSquare, User, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
];

export default function GuideReservations() {
  const [reservations, setReservations] = useState(mockReservations);
  const [selectedReservation, setSelectedReservation] = useState<(typeof mockReservations)[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const updateReservationStatus = (id: string, status: string) => {
    setReservations(
      reservations.map((reservation) => (reservation.id === id ? { ...reservation, status } : reservation)),
    );
    setIsDetailsOpen(false);
  };

  const sendResponse = () => {
    // Dans une vraie application, cela enverrait un message au touriste
    console.log(`Message envoyé à ${selectedReservation?.touristName}: ${responseMessage}`);
    setResponseMessage("");
    setIsDetailsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Réservations</h2>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Toutes les réservations</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmées</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
          <TabsTrigger value="cancelled">Annulées</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onViewDetails={() => {
                  setSelectedReservation(reservation);
                  setIsDetailsOpen(true);
                }}
              />
            ))}
          </div>
        </TabsContent>
        {["pending", "confirmed", "completed", "cancelled"].map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservations
                .filter((reservation) => reservation.status === status)
                .map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onViewDetails={() => {
                      setSelectedReservation(reservation);
                      setIsDetailsOpen(true);
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
              <DialogDescription>
                Réservation pour {selectedReservation.tourName} le{" "}
                {new Date(selectedReservation.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Informations sur le touriste</h3>
                  <p className="text-sm">{selectedReservation.touristName}</p>
                  <p className="text-sm">{selectedReservation.touristEmail}</p>
                  <p className="text-sm">{selectedReservation.touristPhone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Détails de la réservation</h3>
                  <p className="text-sm">Date : {new Date(selectedReservation.date).toLocaleDateString()}</p>
                  <p className="text-sm">Heure : {selectedReservation.time}</p>
                  <p className="text-sm">Participants : {selectedReservation.participants}</p>
                  <p className="text-sm">Prix total : {selectedReservation.totalPrice} TND</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium">Notes du touriste</h3>
                <p className="text-sm bg-muted p-2 rounded-md mt-1">{selectedReservation.notes}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Répondre au touriste</h3>
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
                    <Check className="h-4 w-4" />
                    Confirmer
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={() => updateReservationStatus(selectedReservation.id, "cancelled")}
                  >
                    <X className="h-4 w-4" />
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
                  <Check className="h-4 w-4" />
                  Marquer comme terminé
                </Button>
              )}
              <Button className="flex items-center gap-2" onClick={sendResponse}>
                <MessageSquare className="h-4 w-4" />
                Envoyer le message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface ReservationCardProps {
  reservation: {
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
    notes: string;
    createdAt: string;
  };
  onViewDetails: () => void;
}

function ReservationCard({ reservation, onViewDetails }: ReservationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{reservation.tourName}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Calendar className="h-4 w-4" />
              {new Date(reservation.date).toLocaleDateString()} à {reservation.time}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(reservation.status)}>
            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{reservation.touristName}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{reservation.participants} participants</span>
          </div>
          <div className="font-medium">Total : {reservation.totalPrice} TND</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onViewDetails}>
          Voir les détails
        </Button>
      </CardFooter>
    </Card>
  );
}