"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"
import { Tour } from "@/services/toursService"

// Catégories de tours disponibles
const tourCategories = [
  "Histoire",
  "Culture",
  "Aventure",
  "Gastronomie",
  "Nature"
]

interface TourFormProps {
  onSubmit: (tourData: Omit<Tour, 'id' | '_id'>) => void
  onCancel: () => void
}

export default function TourForm({ onSubmit, onCancel }: TourFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [duration, setDuration] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [maxParticipants, setMaxParticipants] = useState<number>(1)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("")
  const [category, setCategory] = useState<string>("")
  const [isPublic, setIsPublic] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!title.trim()) newErrors.title = "Le titre est requis"
    if (!description.trim()) newErrors.description = "La description est requise"
    if (!location) newErrors.location = "Le lieu est requis"
    if (!duration) newErrors.duration = "La durée est requise"
    if (!price || price <= 0) newErrors.price = "Le prix doit être supérieur à 0"
    if (!maxParticipants || maxParticipants < 1) newErrors.maxParticipants = "Le nombre de participants doit être d'au moins 1"
    if (!date) newErrors.date = "La date est requise"
    if (!time) newErrors.time = "L'heure est requise"
    if (!category) newErrors.category = "La catégorie est requise"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Soumission du formulaire
  const handleSubmit = () => {
    if (!validateForm()) return
    
    const tourData: Omit<Tour, 'id' | '_id'> = {
      title,
      description,
      location,
      duration,
      price,
      maxParticipants,
      date: date ? format(date, 'yyyy-MM-dd') : '',
      time,
      category,
      isPublic,
      guideId: localStorage.getItem('userId') || ''
    }
    
    onSubmit(tourData)
  }

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="title">Titre de la visite</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="location">Lieu</Label>
          <Select
            value={location}
            onValueChange={setLocation}
          >
            <SelectTrigger id="location" className={errors.location ? "border-red-500" : ""}>
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
          {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="duration">Durée</Label>
          <Select
            value={duration}
            onValueChange={setDuration}
          >
            <SelectTrigger id="duration" className={errors.duration ? "border-red-500" : ""}>
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
          {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="price">Prix (TND)</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            min="1"
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="maxParticipants">Nombre max de participants</Label>
          <Input
            id="maxParticipants"
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 0)}
            min="1"
            className={errors.maxParticipants ? "border-red-500" : ""}
          />
          {errors.maxParticipants && <p className="text-red-500 text-sm">{errors.maxParticipants}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  errors.date && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: fr }) : <span>Sélectionnez une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Label htmlFor="time">Heure</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={errors.time ? "border-red-500" : ""}
          />
          {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="category">Catégorie</Label>
        <Select
          value={category}
          onValueChange={setCategory}
        >
          <SelectTrigger id="category" className={errors.category ? "border-red-500" : ""}>
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {tourCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <Label htmlFor="isPublic">Rendre cette visite publique</Label>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white border-0">
          Créer la visite
        </Button>
      </div>
    </div>
  )
}
