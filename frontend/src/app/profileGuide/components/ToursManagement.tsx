"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Eye, EyeOff, MapPin, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Données simulées pour les visites
const mockTours = [
  {
    id: "1",
    title: "Visite historique de la médina de Sousse",
    description: "Explore la médina ancienne de Sousse avec son histoire riche et son architecture magnifique.",
    location: "Sousse",
    duration: "3 heures",
    price: 45,
    maxParticipants: 10,
    date: "2023-07-15",
    time: "09:00",
    isPublic: true,
    image: "/placeholder.svg?height=200&width=300",
    bookings: 3,
  },
  {
    id: "2",
    title: "Visite du Ribat de Monastir et du mausolée",
    description: "Visite du célèbre fort du Ribat et du mausolée de Bourguiba à Monastir.",
    location: "Monastir",
    duration: "4 heures",
    price: 55,
    maxParticipants: 8,
    date: "2023-07-20",
    time: "10:00",
    isPublic: true,
    image: "/placeholder.svg?height=200&width=300",
    bookings: 5,
  },
  {
    id: "3",
    title: "Expérience plage de Sousse",
    description: "Profite des magnifiques plages de Sousse avec diverses activités nautiques.",
    location: "Sousse",
    duration: "5 heures",
    price: 65,
    maxParticipants: 12,
    date: "2023-07-25",
    time: "08:30",
    isPublic: false,
    image: "/placeholder.svg?height=200&width=300",
    bookings: 0,
  },
]

export default function GestionDesVisites() {
  const [tours, setTours] = useState(mockTours)
  const [isAddTourOpen, setIsAddTourOpen] = useState(false)
  const [newTour, setNewTour] = useState({
    title: "",
    description: "",
    location: "",
    duration: "",
    price: 0,
    maxParticipants: 0,
    date: "",
    time: "",
    isPublic: true,
  })

  const handleAddTour = () => {
    const tour = {
      ...newTour,
      id: (tours.length + 1).toString(),
      image: "/placeholder.svg?height=200&width=300",
      bookings: 0,
    }
    setTours([...tours, tour])
    setIsAddTourOpen(false)
    setNewTour({
      title: "",
      description: "",
      location: "",
      duration: "",
      price: 0,
      maxParticipants: 0,
      date: "",
      time: "",
      isPublic: true,
    })
  }

  const toggleTourVisibility = (id: string) => {
    setTours(tours.map((tour) => (tour.id === id ? { ...tour, isPublic: !tour.isPublic } : tour)))
  }

  const deleteTour = (id: string) => {
    setTours(tours.filter((tour) => tour.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Visites</h2>
        <Dialog open={isAddTourOpen} onOpenChange={setIsAddTourOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une nouvelle visite
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle visite</DialogTitle>
              <DialogDescription>
                Remplissez les détails pour créer une nouvelle offre de visite. Vous pouvez la rendre publique ou privée.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="title">Titre de la visite</Label>
                <Input
                  id="title"
                  placeholder="Entrez le titre de la visite"
                  value={newTour.title}
                  onChange={(e) => setNewTour({ ...newTour, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre visite"
                  rows={4}
                  value={newTour.description}
                  onChange={(e) => setNewTour({ ...newTour, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Select
                    value={newTour.location}
                    onValueChange={(value) => setNewTour({ ...newTour, location: value })}
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Sélectionnez une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sousse">Sousse</SelectItem>
                      <SelectItem value="Monastir">Monastir</SelectItem>
                      <SelectItem value="Tunis">Tunis</SelectItem>
                      <SelectItem value="Hammamet">Hammamet</SelectItem>
                      <SelectItem value="Djerba">Djerba</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="duration">Durée</Label>
                  <Select
                    value={newTour.duration}
                    onValueChange={(value) => setNewTour({ ...newTour, duration: value })}
                  >
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Sélectionnez la durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 heure">1 heure</SelectItem>
                      <SelectItem value="2 heures">2 heures</SelectItem>
                      <SelectItem value="3 heures">3 heures</SelectItem>
                      <SelectItem value="4 heures">4 heures</SelectItem>
                      <SelectItem value="5 heures">5 heures</SelectItem>
                      <SelectItem value="Journée complète">Journée complète</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="price">Prix (TND)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={newTour.price}
                    onChange={(e) => setNewTour({ ...newTour, price: Number(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="maxParticipants">Nombre max de participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="0"
                    value={newTour.maxParticipants}
                    onChange={(e) => setNewTour({ ...newTour, maxParticipants: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTour.date}
                    onChange={(e) => setNewTour({ ...newTour, date: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="time">Heure</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newTour.time}
                    onChange={(e) => setNewTour({ ...newTour, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={newTour.isPublic}
                  onCheckedChange={(checked) => setNewTour({ ...newTour, isPublic: checked })}
                />
                <Label htmlFor="isPublic">Rendre cette visite publique</Label>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="tourImage">Image de la visite</Label>
                <Input id="tourImage" type="file" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTourOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddTour}>Créer la visite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Toutes les visites</TabsTrigger>
          <TabsTrigger value="public">Publiques</TabsTrigger>
          <TabsTrigger value="private">Privées</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <TourCard key={tour.id} tour={tour} onToggleVisibility={toggleTourVisibility} onDelete={deleteTour} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="public" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours
              .filter((tour) => tour.isPublic)
              .map((tour) => (
                <TourCard key={tour.id} tour={tour} onToggleVisibility={toggleTourVisibility} onDelete={deleteTour} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="private" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours
              .filter((tour) => !tour.isPublic)
              .map((tour) => (
                <TourCard key={tour.id} tour={tour} onToggleVisibility={toggleTourVisibility} onDelete={deleteTour} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TourCardProps {
  tour: {
    id: string
    title: string
    description: string
    location: string
    duration: string
    price: number
    maxParticipants: number
    date: string
    time: string
    isPublic: boolean
    image: string
    bookings: number
  }
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
}

function TourCard({ tour, onToggleVisibility, onDelete }: TourCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <img src={tour.image || "/placeholder.svg"} alt={tour.title} className="w-full h-full object-cover" />
        <Badge className={`absolute top-2 right-2 ${tour.isPublic ? "bg-green-500" : "bg-gray-500"}`}>
          {tour.isPublic ? "Public" : "Privé"}
        </Badge>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{tour.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => onToggleVisibility(tour.id)}>
                {tour.isPublic ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Passer en privé</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Passer en public</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span>Modifier la visite</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 text-red-500" onClick={() => onDelete(tour.id)}>
                <Trash2 className="h-4 w-4" />
                <span>Supprimer la visite</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {tour.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{tour.description}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(tour.date).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-medium">{tour.duration}</span>
          </div>
          <div>
            <span className="font-medium">{tour.price} TND</span> / personne
          </div>
          <div>
            <span className="font-medium">{tour.bookings}</span> / {tour.maxParticipants} réservés
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="w-full">
          <Edit className="h-4 w-4 mr-2" />
          Modifier les détails
        </Button>
      </CardFooter>
    </Card>
  )
}