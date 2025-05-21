"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { updateTour } from "@/services/toursService"

interface TourEditFormProps {
  tour: any
  onSave: (updatedTour: any) => void
  onCancel: () => void
}

export default function TourEditForm({ tour, onSave, onCancel }: TourEditFormProps) {
  const { toast } = useToast()
  const [editingTour, setEditingTour] = useState(tour)
  
  const handleSaveTour = async () => {
    try {
      // Préparer les données du tour à mettre à jour
      const updatedTourData = {
        ...editingTour,
        price: editingTour.price ? Number(editingTour.price) : 0,
        maxParticipants: editingTour.maxParticipants ? Number(editingTour.maxParticipants) : 1,
      }

      // Appeler l'API pour mettre à jour le tour
      const result = await updateTour(editingTour._id || editingTour.id, updatedTourData)
      
      if (result) {
        toast({
          title: "Tour mis à jour",
          description: "Les modifications ont été enregistrées avec succès.",
        })
        onSave(result)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du tour:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du tour.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="edit-title">Titre de la visite</Label>
        <Input
          id="edit-title"
          value={editingTour.title}
          onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          rows={4}
          value={editingTour.description}
          onChange={(e) => setEditingTour({ ...editingTour, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="edit-location">Lieu</Label>
          <Select
            value={editingTour.location}
            onValueChange={(value) => setEditingTour({ ...editingTour, location: value })}
          >
            <SelectTrigger id="edit-location">
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
          <Label htmlFor="edit-duration">Durée</Label>
          <Select
            value={editingTour.duration}
            onValueChange={(value) => setEditingTour({ ...editingTour, duration: value })}
          >
            <SelectTrigger id="edit-duration">
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
          <Label htmlFor="edit-price">Prix (TND)</Label>
          <Input
            id="edit-price"
            type="number"
            value={editingTour.price}
            onChange={(e) => setEditingTour({ ...editingTour, price: parseFloat(e.target.value) || 0 })}
            min="1"
          />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="edit-maxParticipants">Nombre max de participants</Label>
          <Input
            id="edit-maxParticipants"
            type="number"
            value={editingTour.maxParticipants}
            onChange={(e) => setEditingTour({ ...editingTour, maxParticipants: parseInt(e.target.value) || 0 })}
            min="1"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="edit-isPublic"
          checked={editingTour.isPublic}
          onCheckedChange={(checked) => setEditingTour({ ...editingTour, isPublic: checked })}
        />
        <Label htmlFor="edit-isPublic">Rendre cette visite publique</Label>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSaveTour} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
          Enregistrer les modifications
        </Button>
      </DialogFooter>
    </div>
  )
}
