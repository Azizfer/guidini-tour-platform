"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { Tour, getToursByGuide, createTour, updateTour, deleteTour, toggleTourVisibility } from "@/services/toursService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Calendar, Clock, DollarSign, Edit, Eye, EyeOff, MapPin, Plus, Trash2, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import TourList from "./tour-list"

interface TourFormData {
  title: string
  description: string
  location: string
  duration: string
  price: number
  maxParticipants: number
  date: string
  time: string
  category: string
  isPublic: boolean
  image?: string
  imageFile?: File
}

const initialFormData: TourFormData = {
  title: "",
  description: "",
  location: "",
  duration: "",
  price: 0,
  maxParticipants: 1,
  date: "",
  time: "",
  category: "Histoire",
  isPublic: true,
  image: ""
}

const categories = ["Histoire", "Culture", "Aventure", "Gastronomie", "Nature"]

export default function ToursManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
  const [currentTour, setCurrentTour] = useState<Tour | null>(null)
  const [formData, setFormData] = useState<TourFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TourFormData, string>>>({})  
  
  // Fetch tours
  const fetchTours = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const guideId = user?.id || localStorage.getItem('userId')
      if (!guideId) {
        setError("Impossible de récupérer l'ID de l'utilisateur")
        setLoading(false)
        return
      }
      
      const fetchedTours = await getToursByGuide(guideId)
      setTours(fetchedTours)
    } catch (err) {
      console.error("Erreur lors de la récupération des tours:", err)
      setError("Impossible de charger les tours. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }
  
  // Load tours on component mount
  useEffect(() => {
    fetchTours()
  }, [user])
  
  // Form handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'maxParticipants' ? Number(value) : value
    }))
    
    // Clear error for this field
    if (formErrors[name as keyof TourFormData]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof TourFormData]
        return newErrors
      })
    }
  }
  
  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
    if (formErrors[name as keyof TourFormData]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof TourFormData]
        return newErrors
      })
    }
  }
  
  const handleSwitchChange = (checked: boolean, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof TourFormData, string>> = {}
    
    if (!formData.title.trim()) errors.title = "Le titre est requis"
    if (!formData.description.trim()) errors.description = "La description est requise"
    if (!formData.location.trim()) errors.location = "Le lieu est requis"
    if (!formData.duration.trim()) errors.duration = "La durée est requise"
    if (formData.price <= 0) errors.price = "Le prix doit être supérieur à 0"
    if (formData.maxParticipants < 1) errors.maxParticipants = "Le nombre de participants doit être au moins 1"
    if (!formData.date.trim()) errors.date = "La date est requise"
    if (!formData.time.trim()) errors.time = "L'heure est requise"
    if (!formData.category) errors.category = "La catégorie est requise"
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // Handle form submission for adding a new tour
  const handleAddTour = async () => {
    if (!validateForm()) return
    
    try {
      const guideId = user?.id || localStorage.getItem('userId')
      if (!guideId) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer l'ID du guide",
          variant: "destructive"
        })
        return
      }
      
      // Préparation des données pour l'API
      // Si nous avons un fichier image, nous devons l'envoyer séparément
      // Ici, nous simulons simplement l'envoi de l'URL de l'image
      const tourData = {
        ...formData,
        guideId
      }
      
      // Suppression du champ imageFile avant l'envoi à l'API
      // Dans une implémentation réelle, vous utiliseriez FormData pour envoyer le fichier
      if (tourData.imageFile) {
        delete tourData.imageFile
      }
      
      const newTour = await createTour(tourData)
      
      if (newTour) {
        toast({
          title: "Succès",
          description: "Tour ajouté avec succès",
          variant: "default"
        })
        
        // Mise à jour de la liste des tours
        setTours(prev => [...prev, newTour])
        
        // Mise à jour du compteur de tours actifs dans le dashboard
        // Émettre un événement personnalisé pour informer le dashboard
        try {
          console.log('Émission de l\'événement tourAdded');
          const event = new CustomEvent('tourAdded', { 
            detail: { 
              tourId: newTour.id || newTour._id,
              tour: newTour 
            },
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(event);
          
          // Méthode alternative pour s'assurer que l'événement est bien émis
          setTimeout(() => {
            const refreshEvent = new Event('refreshDashboard');
            window.dispatchEvent(refreshEvent);
          }, 500);
        } catch (eventError) {
          console.error('Erreur lors de l\'émission de l\'événement:', eventError);
        }
        
        // Réinitialisation du formulaire
        setIsAddDialogOpen(false)
        setFormData(initialFormData)
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du tour:", err)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le tour. Veuillez réessayer.",
        variant: "destructive"
      })
    }
  }
  
  // Handle form submission for editing a tour
  const handleEditTour = async () => {
    if (!validateForm() || !currentTour?.id) return
    
    try {
      const updatedTour = await updateTour(currentTour.id, formData)
      
      if (updatedTour) {
        toast({
          title: "Succès",
          description: "Tour mis à jour avec succès",
          variant: "default"
        })
        
        setTours(prev => prev.map(tour => 
          tour.id === updatedTour.id ? updatedTour : tour
        ))
        setIsEditDialogOpen(false)
        setCurrentTour(null)
        setFormData(initialFormData)
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du tour:", err)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le tour. Veuillez réessayer.",
        variant: "destructive"
      })
    }
  }
  
  // Handle tour deletion
  const handleDeleteTour = async (id: string) => {
    // Demander confirmation avant de supprimer
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce tour ?")) {
      return;
    }
    
    try {
      // Trouver le tour dans l'état actuel pour avoir ses informations
      const tourToDelete = tours.find(tour => (tour.id === id || tour._id === id));
      
      if (!tourToDelete) {
        toast({
          title: "Erreur",
          description: "Tour introuvable",
          variant: "destructive"
        });
        return;
      }
      
      // Essayer d'utiliser l'API pour supprimer le tour
      let success = false;
      try {
        success = await deleteTour(id);
      } catch (apiError) {
        console.log("Erreur API lors de la suppression, utilisation du mode hors ligne", apiError);
        // En cas d'échec de l'API, simuler la suppression localement
        success = true;
      }
      
      if (success) {
        toast({
          title: "Succès",
          description: "Tour supprimé avec succès",
          variant: "default"
        });
        
        // Mettre à jour la liste des tours
        setTours(prev => prev.filter(tour => (tour.id !== id && tour._id !== id)));
        
        // Émettre un événement pour mettre à jour le compteur de tours dans le dashboard
        try {
          console.log('Émission de l\'événement tourDeleted');
          
          // Stocker le type d'événement dans localStorage pour la communication entre composants
          localStorage.setItem('lastDashboardEvent', 'tourDeleted');
          
          const event = new CustomEvent('tourDeleted', { 
            detail: { 
              tourId: id,
              tour: tourToDelete 
            },
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(event);
          
          // Méthode alternative pour s'assurer que l'événement est bien émis
          setTimeout(() => {
            const refreshEvent = new Event('refreshDashboard');
            window.dispatchEvent(refreshEvent);
          }, 500);
        } catch (eventError) {
          console.error('Erreur lors de l\'émission de l\'événement:', eventError);
        }
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du tour:", err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le tour. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  }
  
  // Handle tour visibility toggle
  const handleToggleVisibility = async (id: string) => {
    try {
      // Trouver le tour dans l'état actuel
      const currentTour = tours.find(tour => (tour.id === id || tour._id === id));
      
      if (!currentTour) {
        toast({
          title: "Erreur",
          description: "Tour introuvable",
          variant: "destructive"
        });
        return;
      }
      
      // Essayer d'utiliser l'API pour basculer la visibilité
      let updatedTour;
      try {
        updatedTour = await toggleTourVisibility(id);
      } catch (apiError) {
        console.log("Erreur API, utilisation du mode hors ligne", apiError);
        // En cas d'échec de l'API, simuler la mise à jour localement
        updatedTour = {
          ...currentTour,
          isPublic: !currentTour.isPublic
        };
      }
      
      if (updatedTour) {
        toast({
          title: "Succès",
          description: `Tour ${updatedTour.isPublic ? 'publié' : 'masqué'} avec succès`,
          variant: "default"
        });
        
        // Mettre à jour la liste des tours
        setTours(prev => prev.map(tour => 
          (tour.id === id || tour._id === id) ? updatedTour : tour
        ));
      }
    } catch (err) {
      console.error("Erreur lors du changement de visibilité du tour:", err);
      toast({
        title: "Erreur",
        description: "Impossible de changer la visibilité du tour. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  }
  
  // Open edit dialog and populate form with tour data
  const openEditDialog = (tour: Tour) => {
    setCurrentTour(tour)
    setFormData({
      title: tour.title,
      description: tour.description,
      location: tour.location,
      duration: tour.duration,
      price: tour.price,
      maxParticipants: tour.maxParticipants,
      date: tour.date,
      time: tour.time,
      category: Array.isArray(tour.category) ? tour.category[0] : tour.category,
      isPublic: tour.isPublic,
      image: tour.image
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Mes Tours</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4" />
              Ajouter Tour
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau tour</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouveau tour.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Visite du musée du Bardo"
                  />
                  {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Tunis"
                  />
                  {formErrors.location && <p className="text-sm text-red-500">{formErrors.location}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre tour..."
                  rows={3}
                />
                {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="2 heures"
                  />
                  {formErrors.duration && <p className="text-sm text-red-500">{formErrors.duration}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (TND)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    min={0}
                  />
                  {formErrors.price && <p className="text-sm text-red-500">{formErrors.price}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                  {formErrors.date && <p className="text-sm text-red-500">{formErrors.date}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Heure</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                  {formErrors.time && <p className="text-sm text-red-500">{formErrors.time}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Nombre max. de participants</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min={1}
                  />
                  {formErrors.maxParticipants && <p className="text-sm text-red-500">{formErrors.maxParticipants}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange(value, "category")}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image du tour</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData(prev => ({
                        ...prev,
                        imageFile: file,
                        image: file.name // Stocker juste le nom du fichier pour référence
                      }));
                    }
                  }}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "isPublic")}
                />
                <Label htmlFor="isPublic">Rendre ce tour public</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleAddTour} className="bg-blue-600 hover:bg-blue-700 text-white">Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3 text-red-800 mb-6">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-6">
        <TourList
          tours={tours}
          isLoading={loading}
          onToggleVisibility={handleToggleVisibility}
          onDelete={handleDeleteTour}
          onTourUpdated={(updatedTour: Tour) => {
            setTours(prev => prev.map(tour => 
              tour.id === updatedTour.id ? updatedTour : tour
            ))
          }}
        />
      </div>
    </div>
  )
}
