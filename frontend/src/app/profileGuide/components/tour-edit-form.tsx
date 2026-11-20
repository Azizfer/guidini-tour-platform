"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { updateTour } from "@/services/toursService"
import { MapPin, Users, DollarSign, Tag, Eye, EyeOff } from "lucide-react"

interface TourEditFormProps {
  tour: any
  onSave: (updatedTour: any) => void
  onCancel: () => void
}

export default function TourEditForm({ tour, onSave, onCancel }: TourEditFormProps) {
  const { toast } = useToast()
  const [editingTour, setEditingTour] = useState(tour)
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveTour = async () => {
    setIsLoading(true)
    try {
      const updatedTourData = {
        ...editingTour,
        price: editingTour.price ? Number(editingTour.price) : 0,
        maxParticipants: editingTour.maxParticipants ? Number(editingTour.maxParticipants) : 1,
      }

      const result = await updateTour(editingTour._id || editingTour.id, updatedTourData)

      if (result) {
        toast({
          title: "Tour mis à jour",
          description: "Les modifications ont été enregistrées avec succès.",
        })

        const tourStatusEvent = new CustomEvent("tourStatusChanged", {
          detail: { tourId: editingTour._id || editingTour.id, status: "updated" },
        })
        window.dispatchEvent(tourStatusEvent)

        onCancel()
        onSave(result)
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du tour:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du tour.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid gap-6 py-4"
    >
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Tag className="h-5 w-5 text-gray-600" />
          Informations générales
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-sm font-medium text-gray-700">
              Titre de la visite
            </Label>
            <Input
              id="edit-title"
              value={editingTour.title}
              onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
              className="rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              placeholder="Titre de votre visite"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="edit-description"
              rows={4}
              value={editingTour.description}
              onChange={(e) => setEditingTour({ ...editingTour, description: e.target.value })}
              className="rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              placeholder="Décrivez votre visite en détail..."
            />
          </div>
        </div>
      </div>

      {/* Location and Duration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-600" />
          Lieu et durée
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-location" className="text-sm font-medium text-gray-700">
              Lieu
            </Label>
            <Select
              value={editingTour.location}
              onValueChange={(value) => setEditingTour({ ...editingTour, location: value })}
            >
              <SelectTrigger
                id="edit-location"
                className="rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              >
                <SelectValue placeholder="Sélectionnez une ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sousse">Sousse</SelectItem>
                <SelectItem value="Monastir">Monastir</SelectItem>
                <SelectItem value="Tunis">Tunis</SelectItem>
                <SelectItem value="Hammamet">Hammamet</SelectItem>
                <SelectItem value="Djerba">Djerba</SelectItem>
                <SelectItem value="Kairouan">Kairouan</SelectItem>
                <SelectItem value="Tozeur">Tozeur</SelectItem>
                <SelectItem value="Sidi Bou Said">Sidi Bou Said</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-duration" className="text-sm font-medium text-gray-700">
              Durée
            </Label>
            <Select
              value={editingTour.duration}
              onValueChange={(value) => setEditingTour({ ...editingTour, duration: value })}
            >
              <SelectTrigger
                id="edit-duration"
                className="rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              >
                <SelectValue placeholder="Sélectionnez la durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 heure">1 heure</SelectItem>
                <SelectItem value="2 heures">2 heures</SelectItem>
                <SelectItem value="3 heures">3 heures</SelectItem>
                <SelectItem value="4 heures">4 heures</SelectItem>
                <SelectItem value="5 heures">5 heures</SelectItem>
                <SelectItem value="Demi-journée">Demi-journée</SelectItem>
                <SelectItem value="Journée complète">Journée complète</SelectItem>
                <SelectItem value="2 jours">2 jours</SelectItem>
                <SelectItem value="3 jours">3 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pricing and Capacity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-gray-600" />
          Prix et capacité
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-price" className="text-sm font-medium text-gray-700">
              Prix (TND)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="edit-price"
                type="number"
                value={editingTour.price}
                onChange={(e) => setEditingTour({ ...editingTour, price: Number.parseFloat(e.target.value) || 0 })}
                min="1"
                className="pl-10 rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                placeholder="Prix en TND"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-maxParticipants" className="text-sm font-medium text-gray-700">
              Nombre max de participants
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="edit-maxParticipants"
                type="number"
                value={editingTour.maxParticipants}
                onChange={(e) =>
                  setEditingTour({ ...editingTour, maxParticipants: Number.parseInt(e.target.value) || 0 })
                }
                min="1"
                className="pl-10 rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                placeholder="Nombre de participants"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {editingTour.isPublic ? (
            <Eye className="h-5 w-5 text-gray-600" />
          ) : (
            <EyeOff className="h-5 w-5 text-gray-600" />
          )}
          Visibilité
        </h3>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="edit-isPublic" className="text-sm font-medium text-gray-700">
              Rendre cette visite publique
            </Label>
            <p className="text-sm text-gray-500">
              {editingTour.isPublic
                ? "Cette visite sera visible par tous les touristes"
                : "Cette visite restera privée et ne sera pas visible publiquement"}
            </p>
          </div>
          <Switch
            id="edit-isPublic"
            checked={editingTour.isPublic}
            onCheckedChange={(checked) => setEditingTour({ ...editingTour, isPublic: checked })}
            className="data-[state=checked]:bg-gray-800"
          />
        </div>
      </div>

      <DialogFooter className="pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onCancel}
          className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSaveTour}
          disabled={isLoading}
          className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Enregistrement...
            </>
          ) : (
            "Enregistrer les modifications"
          )}
        </Button>
      </DialogFooter>
    </motion.div>
  )
}
