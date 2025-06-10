"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/LogingContext/AuthContext"
import {
  type Tour,
  type TourStatus,
  getToursByGuide,
  createTour,
  deleteTour,
  toggleTourVisibility,
  markTourAsCompleted,
} from "@/services/toursService"
import { updateTourStatusStats } from "@/services/guideStatsService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import TourList from "./tour-list"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface TourFormData {
  title: string
  description: string
  location: string
  duration: string
  price: number
  maxParticipants: number
  date: string
  time: string
  categories: string[]
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
  categories: [],
  isPublic: true,
  image: "",
}

const CATEGORY_OPTIONS = ["Histoire", "Culture", "Aventure", "Gastronomie", "Nature"]

export default function ToursManagement() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false)
  const [formData, setFormData] = useState<TourFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TourFormData, string>>>({})

  // Fetch tours
  const fetchTours = async () => {
    try {
      setLoading(true)
      setError(null)

      const guideId = user?.id || localStorage.getItem("userId")
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

  // Define the type for our custom event
  type TourStatusChangeEvent = CustomEvent<{
    tourId: string
    status: TourStatus
  }>

  // Listen for tour status change events
  useEffect(() => {
    const handleTourStatusChange = async (event: Event) => {
      const customEvent = event as TourStatusChangeEvent
      const { tourId, status } = customEvent.detail

      if (status === "completed") {
        try {
          const currentTour = tours.find((tour) => tour.id === tourId || tour._id === tourId)
          if (!currentTour) return

          const oldStatus = currentTour.tourStatus as TourStatus
          const updatedTour = await markTourAsCompleted(tourId)

          if (updatedTour) {
            setTours((prev) =>
              prev.map((tour) =>
                tour.id === tourId || tour._id === tourId ? { ...tour, tourStatus: "completed" } : tour,
              ),
            )

            const guideId = user?.id || localStorage.getItem("userId") || ""
            await updateTourStatusStats(guideId, oldStatus, "completed")

            toast({
              title: "Succès",
              description: "Tour marqué comme complété avec succès",
              variant: "default",
            })

            const refreshEvent = new Event("refreshDashboard")
            window.dispatchEvent(refreshEvent)
          }
        } catch (error) {
          console.error("Error marking tour as completed:", error)
          toast({
            title: "Erreur",
            description: "Impossible de marquer le tour comme complété",
            variant: "destructive",
          })
        }
      }
    }

    window.addEventListener("tourStatusChanged", handleTourStatusChange)
    return () => {
      window.removeEventListener("tourStatusChanged", handleTourStatusChange)
    }
  }, [tours, user, toast])

  // Form handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "maxParticipants" ? Number(value) : value,
    }))

    if (formErrors[name as keyof TourFormData]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof TourFormData]
        return newErrors
      })
    }
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (formErrors[name as keyof TourFormData]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof TourFormData]
        return newErrors
      })
    }
  }

  const handleSwitchChange = (checked: boolean, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
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
    if (formData.categories.length === 0) errors.categories = "Sélectionnez au moins une catégorie"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form submission for adding a new tour
  const handleAddTour = async () => {
    if (!validateForm()) return

    try {
      const guideId = user?.id || localStorage.getItem("userId")
      if (!guideId) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer l'ID du guide",
          variant: "destructive",
        })
        return
      }

      const { categories, ...rest } = formData
      const tourData = {
        ...rest,
        category: categories, // API expects `category`
        guideId,
        tourStatus: (formData.isPublic ? "active" : "private") as TourStatus,
      }

      // Ne pas supprimer imageFile, il sera pris en charge par toursService pour l'upload multipart

      const newTour = await createTour(tourData)

      if (newTour) {
        toast({
          title: "Succès",
          description: "Tour ajouté avec succès",
          variant: "default",
        })

        setTours((prev) => [...prev, newTour])

        const guideId = user?.id || localStorage.getItem("userId") || ""
        updateTourStatusStats(guideId, null, newTour.tourStatus)

        try {
          const event = new CustomEvent("tourAdded", {
            detail: {
              tourId: newTour.id || newTour._id,
              tour: newTour,
            },
            bubbles: true,
            cancelable: true,
          })
          window.dispatchEvent(event)

          setTimeout(() => {
            const refreshEvent = new Event("refreshDashboard")
            window.dispatchEvent(refreshEvent)
          }, 500)
        } catch (eventError) {
          console.error("Erreur lors de l'émission de l'événement:", eventError)
        }

        setIsAddDialogOpen(false)
        setFormData(initialFormData)
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du tour:", err)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le tour. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  // Handle tour deletion
  const handleDeleteTour = async (id: string) => {
    try {
      // Find the current tour to get its previous status before deletion
      const currentTour = tours.find((tour) => tour.id === id || tour._id === id)
      const oldStatus = currentTour?.tourStatus as TourStatus | undefined

      const success = await deleteTour(id)

      if (success) {
        toast({
          title: "Succès",
          description: "Tour supprimé avec succès",
          variant: "default",
        })

        setTours((prev) =>
          prev.filter((tour) => {
            const tourId = tour._id || tour.id
            return tourId !== id
          }),
        )

        // Update guide stats if we had the previous status
        const guideId = user?.id || localStorage.getItem("userId") || ""
        if (oldStatus) {
          await updateTourStatusStats(guideId, oldStatus, "deleted")
        } else {
          // If old status not found, still trigger stats refresh on backend with null
          await updateTourStatusStats(guideId, null, "deleted")
        }

        // Trigger dashboard refresh so stats components update
        const refreshEvent = new Event("refreshDashboard")
        window.dispatchEvent(refreshEvent)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le tour. Veuillez réessayer.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du tour:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      })
    }
  }

  // Handle tour visibility toggle
  const handleToggleVisibility = async (id: string) => {
    try {
      const currentTour = tours.find((tour) => tour.id === id || tour._id === id)

      if (!currentTour) {
        toast({
          title: "Erreur",
          description: "Tour introuvable",
          variant: "destructive",
        })
        return
      }

      if (currentTour.tourStatus === "completed") {
        toast({
          title: "Action impossible",
          description: "Un tour complété ne peut pas changer de statut",
          variant: "destructive",
        })
        return
      }

      const newStatus: TourStatus = currentTour.tourStatus === "active" ? "private" : "active"

      let updatedTour
      try {
        updatedTour = await toggleTourVisibility(id)

        if (updatedTour && !updatedTour.tourStatus) {
          updatedTour.tourStatus = newStatus
        }
      } catch (apiError) {
        console.log("Erreur API, utilisation du mode hors ligne", apiError)
        updatedTour = {
          ...currentTour,
          isPublic: newStatus === "active",
          tourStatus: newStatus,
        }
      }

      if (updatedTour) {
        const guideId = user?.id || localStorage.getItem("userId") || ""
        await updateTourStatusStats(guideId, currentTour.tourStatus as TourStatus, updatedTour.tourStatus as TourStatus)

        toast({
          title: "Succès",
          description: `Tour ${updatedTour.tourStatus === "active" ? "activé" : "passé en privé"} avec succès`,
          variant: "default",
        })

        setTours((prev) => prev.map((tour) => (tour.id === id || tour._id === id ? updatedTour : tour)))

        const refreshEvent = new Event("refreshDashboard")
        window.dispatchEvent(refreshEvent)
      }
    } catch (err) {
      console.error("Erreur lors du changement de visibilité du tour:", err)
      toast({
        title: "Erreur",
        description: "Impossible de changer la visibilité du tour. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mes Tours</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all">
              <Plus className="h-4 w-4" />
              Ajouter un Tour
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-xl font-semibold text-gray-900">Créer un nouveau tour</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Remplissez les informations pour créer votre tour.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Titre
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Visite du musée du Bardo"
                    className="h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Lieu
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Tunis"
                    className="h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.location && <p className="text-xs text-red-500">{formErrors.location}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Décrivez votre tour..."
                  className="text-sm min-h-[70px] rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
                {formErrors.description && <p className="text-xs text-red-500">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                    Durée
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="2 heures"
                    className="h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.duration && <p className="text-xs text-red-500">{formErrors.duration}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                    Prix (TND)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    min={0}
                    className="h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.price && <p className="text-xs text-red-500">{formErrors.price}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Date
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.date && <p className="text-xs text-red-500">{formErrors.date}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                    Heure
                  </Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.time && <p className="text-xs text-red-500">{formErrors.time}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants" className="text-sm font-medium text-gray-700">
                    Participants max
                  </Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min={1}
                    className="h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.maxParticipants && <p className="text-xs text-red-500">{formErrors.maxParticipants}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Catégories</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="h-9 w-full justify-between text-sm rounded-lg border-gray-300">
                        {formData.categories.length > 0 ? formData.categories.join(", ") : "Sélectionnez"}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <DropdownMenuCheckboxItem
                          key={cat}
                          checked={formData.categories.includes(cat)}
                          onCheckedChange={(checked) => {
                            const newCats = checked
                              ? [...formData.categories, cat]
                              : formData.categories.filter((c) => c !== cat)
                            setFormData((prev) => ({ ...prev, categories: newCats }))
                            if (formErrors.categories) {
                              setFormErrors((prev) => {
                                const newErr = { ...prev }
                                delete newErr.categories
                                return newErr
                              })
                            }
                          }}
                          className="text-sm"
                        >
                          {cat}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {formErrors.categories && <p className="text-xs text-red-500">{formErrors.categories}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium text-gray-700">
                  Image du tour
                </Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData((prev) => ({
                        ...prev,
                        imageFile: file,
                        image: file.name,
                      }))
                    }
                  }}
                  className="cursor-pointer h-9 text-sm py-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                    Tour public
                  </Label>
                  <p className="text-xs text-gray-500">Visible par tous les touristes</p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleSwitchChange(checked, "isPublic")}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button onClick={handleAddTour} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Créer le tour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800">
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
            setTours((prev) =>
              prev.map((tour) => (tour.id === updatedTour.id || tour._id === updatedTour._id ? updatedTour : tour)),
            )
          }}
        />
      </div>
    </div>
  )
}
