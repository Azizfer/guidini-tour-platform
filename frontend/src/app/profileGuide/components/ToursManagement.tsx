"use client"

import { useState, useEffect } from "react"
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
import { Tour, createTour, deleteTour as apiDeleteTour, getToursByGuide, toggleTourVisibility as apiToggleVisibility, useToursStore } from "@/services/toursService"
import { useAuth } from "@/app/LogingContext/AuthContext"

// Type pour les toasts
interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Hook personnalisé pour les toasts (version simplifiée)
function useToast() {
  const showToast = (props: ToastProps) => {
    console.log(`Toast: ${props.title} - ${props.description}`);
    // Dans une implémentation réelle, cela afficherait un toast UI
  };
  
  return { toast: showToast };
}

export default function GestionDesVisites() {
  const [tours, setTours] = useState<Tour[]>([])
  const [isAddTourOpen, setIsAddTourOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const [newTour, setNewTour] = useState<Omit<Tour, 'id' | '_id'>>({
    title: "",
    description: "",
    location: "",
    duration: "",
    price: 0,
    maxParticipants: 0,
    date: "",
    time: "",
    isPublic: true,
    category: "Histoire"
  })

  // Charger les tours du guide au chargement du composant
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true)
        if (user?.id) {
          const data = await getToursByGuide(user.id)
          setTours(data as Tour[])
        } else {
          // Message d'erreur si l'utilisateur n'est pas connecté
          toast({
            title: "Erreur d'authentification",
            description: "Vous devez être connecté pour voir vos tours.",
            variant: "destructive"
          })
          setTours([]) // Initialiser avec un tableau vide au lieu des données simulées
        }
      } catch (error) {
        console.error("Erreur lors du chargement des tours:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger vos tours. Veuillez réessayer plus tard.",
          variant: "destructive"
        })
        setTours([]) // Initialiser avec un tableau vide au lieu des données simulées
      } finally {
        setIsLoading(false)
      }
    }

    fetchTours()
  }, [user])

  const handleAddTour = async () => {
    try {
      setIsLoading(true)
      
      // Vérifier si l'utilisateur est un guide
      if (!user || user.userType !== 'guide') {
        console.error("L'utilisateur n'est pas un guide. Type d'utilisateur:", user?.userType);
        toast({
          title: "Accès refusé",
          description: "Seuls les guides peuvent créer des visites.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Vérifier que l'ID utilisateur est disponible
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error("ID utilisateur non trouvé dans localStorage");
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter pour créer une visite.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Ajouter des logs pour déboguer
      console.log("Données du tour à créer:", newTour)
      console.log("Utilisateur connecté:", user)
      console.log("ID utilisateur depuis localStorage:", userId)
      
      // Vérifier que toutes les données requises sont présentes
      if (!newTour.title || !newTour.description || !newTour.location || 
          !newTour.duration || !newTour.date || !newTour.time || 
          newTour.price <= 0 || newTour.maxParticipants <= 0) {
        console.error("Données du tour incomplètes:", newTour)
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }
      
      // Ajouter l'ID du guide aux données du tour
      const tourDataWithGuideId = {
        ...newTour,
        guideId: userId
      };
      
      // Créer le tour via l'API
      console.log("Appel de createTour avec:", tourDataWithGuideId)
      const createdTour = await createTour(tourDataWithGuideId)
      console.log("Tour créé avec succès:", createdTour)
      
      // Ajouter le tour créé à l'état local
      setTours([...tours, createdTour as Tour])
      
      // Fermer le modal et réinitialiser le formulaire
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
        category: "Histoire"
      })
      
      toast({
        title: "Succès",
        description: "Votre tour a été créé avec succès!"
      })
    } catch (error) {
      // Utiliser console.log au lieu de console.error pour éviter l'erreur TypeScript
      console.log("Erreur détaillée lors de la création du tour:", error)
      
      // Afficher plus de détails sur l'erreur
      if (error instanceof Error) {
        toast({
          title: "Erreur",
          description: `Impossible de créer le tour: ${error.message}`,
          variant: "destructive"
        })
      } else if (typeof error === 'string') {
        toast({
          title: "Erreur",
          description: `Impossible de créer le tour: ${error}`,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer le tour. Veuillez réessayer.",
          variant: "destructive"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTourVisibility = async (id: string) => {
    try {
      setIsLoading(true)
      
      // Appeler l'API pour changer la visibilité
      const updatedTour = await apiToggleVisibility(id) as Tour
      
      // Mettre à jour l'état local
      setTours(tours.map((tour) => (tour._id === id || tour.id === id ? { ...tour, isPublic: !tour.isPublic } : tour)))
      
      toast({
        title: "Succès",
        description: `Le tour est maintenant ${updatedTour.isPublic ? 'visible' : 'invisible'} pour le public.`
      })
    } catch (error) {
      console.error("Erreur lors du changement de visibilité:", error)
      toast({
        title: "Erreur",
        description: "Impossible de changer la visibilité du tour."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTour = async (id: string) => {
    try {
      setIsLoading(true)
      
      // Appeler l'API pour supprimer le tour
      await apiDeleteTour(id)
      
      // Mettre à jour l'état local
      setTours(tours.filter((tour) => tour._id !== id && tour.id !== id))
      
      toast({
        title: "Succès",
        description: "Le tour a été supprimé avec succès."
      })
    } catch (error) {
      console.error("Erreur lors de la suppression du tour:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le tour."
      })
    } finally {
      setIsLoading(false)
    }
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
              <TourCard key={tour._id || tour.id} tour={tour} onToggleVisibility={toggleTourVisibility} onDelete={deleteTour} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="public" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours
              .filter((tour) => tour.isPublic)
              .map((tour) => (
                <TourCard key={tour._id || tour.id} tour={tour} onToggleVisibility={toggleTourVisibility} onDelete={deleteTour} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="private" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours
              .filter((tour) => !tour.isPublic)
              .map((tour) => (
                <TourCard key={tour._id || tour.id} tour={tour} onToggleVisibility={toggleTourVisibility} onDelete={deleteTour} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TourCardProps {
  tour: Tour
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
}

function TourCard({ tour, onToggleVisibility, onDelete }: TourCardProps) {
  const tourId = tour._id || tour.id || "" // Utiliser _id (MongoDB) ou id (fallback)
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
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => onToggleVisibility(tourId)}>
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
              <DropdownMenuItem className="flex items-center gap-2 text-red-500" onClick={() => onDelete(tourId)}>
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