"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  EllipsisHorizontalIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  TagIcon
} from "@heroicons/react/24/outline"
import { Tour } from "@/services/toursService"
import TourEditForm from "./tour-edit-form"

interface TourListProps {
  tours: Tour[]
  isLoading: boolean
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  onTourUpdated: (updatedTour: Tour) => void
}

export default function TourList({ tours, isLoading, onToggleVisibility, onDelete, onTourUpdated }: TourListProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)

  // Filtrer les tours en fonction de l'onglet actif
  const filteredTours = tours.filter(tour => {
    if (activeTab === "all") return true
    if (activeTab === "public") return tour.isPublic
    if (activeTab === "private") return !tour.isPublic
    return true
  })

  // Ouvrir le dialogue d'édition
  const openEditDialog = (tour: Tour) => {
    setSelectedTour(tour)
    setIsEditDialogOpen(true)
  }

  // Gérer la fermeture du dialogue d'édition
  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false)
    setSelectedTour(null)
  }

  // Gérer la sauvegarde d'un tour modifié
  const handleTourSaved = (updatedTour: Tour) => {
    onTourUpdated(updatedTour)
    setIsEditDialogOpen(false)
    setSelectedTour(null)
  }

  return (
    <>
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="public">Publiques</TabsTrigger>
          <TabsTrigger value="private">Privées</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-slate-500">Chargement des visites...</p>
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-40 gap-2">
              <p className="text-slate-500">Aucune visite {activeTab === "public" ? "publique" : activeTab === "private" ? "privée" : ""} trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour) => (
                <TourCard
                  key={tour._id || tour.id}
                  tour={tour}
                  onToggleVisibility={onToggleVisibility}
                  onDelete={onDelete}
                  openEditDialog={openEditDialog}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogue d'édition de tour */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier la visite</DialogTitle>
          </DialogHeader>
          {selectedTour && (
            <TourEditForm
              tour={selectedTour}
              onSave={handleTourSaved}
              onCancel={handleEditDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

interface TourCardProps {
  tour: Tour
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  openEditDialog: (tour: Tour) => void
}

function TourCard({ tour, onToggleVisibility, onDelete, openEditDialog }: TourCardProps) {
  const tourId = tour._id || tour.id || ""
  
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {tour.image && (
        <div className="relative w-full h-40 overflow-hidden">
          <img 
            src={tour.image.startsWith('/') || tour.image.startsWith('http') ? tour.image : `/uploads/${tour.image}`} 
            alt={tour.title} 
            className="w-full h-full object-cover" 
            onError={(e) => {
              // Fallback en cas d'erreur de chargement de l'image
              e.currentTarget.src = '/placeholder-tour.jpg';
            }}
          />
        </div>
      )}
      <CardHeader className="pb-2 flex-grow-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-slate-900">{tour.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <EllipsisHorizontalIcon className="h-5 w-5" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => onToggleVisibility(tourId)}
              >
                {tour.isPublic ? (
                  <>
                    <EyeSlashIcon className="h-4 w-4" />
                    <span>Passer en privé</span>
                  </>
                ) : (
                  <>
                    <EyeIcon className="h-4 w-4" />
                    <span>Publier</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => openEditDialog(tour)}
              >
                <PencilIcon className="h-4 w-4" />
                <span>Modifier</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 cursor-pointer"
                onClick={() => onDelete(tourId)}
              >
                <TrashIcon className="h-4 w-4" />
                <span>Supprimer</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-slate-500">
          {tour.location} • {tour.duration}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 flex-grow space-y-3">
        <p className="text-slate-700 line-clamp-3">{tour.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          {/* Date et heure */}
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">{tour.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">{tour.time}</span>
          </div>
          
          {/* Participants */}
          <div className="flex items-center gap-1.5">
            <UsersIcon className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">Max: {tour.maxParticipants} pers.</span>
          </div>
          
          {/* Catégorie */}
          <div className="flex items-center gap-1.5">
            <TagIcon className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">{Array.isArray(tour.category) ? tour.category[0] : tour.category}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex-grow-0 flex justify-between items-center border-t border-slate-100">
        <div className="text-slate-900 font-semibold">{tour.price} TND</div>
        <div className="flex items-center gap-1">
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
            tour.isPublic ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
          }`}>
            {tour.isPublic ? "Publique" : "Privée"}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
