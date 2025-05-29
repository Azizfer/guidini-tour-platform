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
  TagIcon,
  CheckCircleIcon
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
  const [activeTab, setActiveTab] = useState("active")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tourToDelete, setTourToDelete] = useState<string>("") 
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)

  // Filtrer les tours en fonction de l'onglet actif
  const filteredTours = tours.filter(tour => {
    if (activeTab === "active") return tour.tourStatus === 'active'
    if (activeTab === "completed") return tour.tourStatus === 'completed'
    if (activeTab === "private") return tour.tourStatus === 'private'
    return true
  })

  // Ouvrir le dialogue d'édition
  const openEditDialog = (tour: Tour) => {
    setSelectedTour(tour)
    setIsEditDialogOpen(true)
  }

  // Gérer la fermeture du dialogue d'édition
  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setSelectedTour(null)
  }
  
  // Gérer la confirmation de suppression
  const handleDeleteConfirmation = (tourId: string) => {
    setTourToDelete(tourId)
    setIsDeleteDialogOpen(true)
  }
  
  // Effectuer la suppression après confirmation
  const confirmDelete = () => {
    onDelete(tourToDelete)
    setIsDeleteDialogOpen(false)
    setTourToDelete("")
  }

  // Gérer la sauvegarde d'un tour modifié
  const handleTourSaved = (updatedTour: Tour) => {
    onTourUpdated(updatedTour)
    setIsEditDialogOpen(false)
    setSelectedTour(null)
  }

  return (
    <>
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Complétés</TabsTrigger>
          <TabsTrigger value="private">Privées</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-slate-500">Chargement des visites...</p>
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-40 gap-2">
              <p className="text-slate-500">Aucune visite {activeTab === "active" ? "active" : activeTab === "completed" ? "complétée" : activeTab === "private" ? "privée" : ""} trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTours.map((tour, index) => (
                <TourCard
                  key={`${tour._id || tour.id}-${index}`}
                  tour={tour}
                  onToggleVisibility={onToggleVisibility}
                  onDelete={handleDeleteConfirmation}
                  openEditDialog={openEditDialog}
                  onTourUpdated={onTourUpdated}
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
              onCancel={handleCloseEditDialog} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Delete Confirmation Dialog */}

    </>
  )
}

interface TourCardProps {
  tour: Tour
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
  openEditDialog: (tour: Tour) => void
  onTourUpdated: (updatedTour: Tour) => void
}

function TourCard({ tour, onToggleVisibility, onDelete, openEditDialog, onTourUpdated }: TourCardProps) {
  // Ensure we have a valid ID for the tour - MongoDB uses _id
  const tourId = tour._id || tour.id || ""
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
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
              {/* Only show visibility toggle for non-completed tours */}
              {tour.tourStatus !== 'completed' && (
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => onToggleVisibility(tourId)}
                >
                  {tour.tourStatus === 'active' ? (
                    <>
                      <EyeSlashIcon className="h-4 w-4" />
                      <span>Passer en privé</span>
                    </>
                  ) : tour.tourStatus === 'private' ? (
                    <>
                      <EyeIcon className="h-4 w-4" />
                      <span>Passer en public</span>
                    </>
                  ) : null}
                </DropdownMenuItem>
              )}
              {/* Only show 'Mark as completed' for active tours (not private or completed) */}
              {tour.tourStatus === 'active' && (
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    console.log(`Marking tour ${tourId} as completed`);
                    // Dispatch event to mark tour as completed
                    const event = new CustomEvent('tourStatusChanged', {
                      detail: { tourId, status: 'completed' }
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Marquer comme complété</span>
                </DropdownMenuItem>
              )}
              {/* Hide the Modifier option for completed tours */}
              {tour.tourStatus !== 'completed' && (
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => openEditDialog(tour)}
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Modifier</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="flex items-center gap-2 text-red-600 cursor-pointer"
                onClick={() => setIsDeleteDialogOpen(true)}
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
            tour.tourStatus === 'active' ? "bg-blue-100 text-blue-800" : 
            tour.tourStatus === 'completed' ? "bg-green-100 text-green-800" : 
            "bg-amber-100 text-amber-800"
          }`}>
            {tour.tourStatus === 'active' ? "Active" : 
             tour.tourStatus === 'completed' ? "Complété" : 
             "Privée"}
          </span>
        </div>
      </CardFooter>

      {/* Custom Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsDeleteDialogOpen(false)}></div>
          
          {/* Confirmation dialog */}
          <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Confirmation de suppression</h3>
            <p className="text-slate-700 mb-6">
              Êtes-vous sûr de vouloir supprimer cette visite ?
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!tourId) {
                    console.error('Tentative de suppression avec un ID invalide');
                    return;
                  }
                  
                  // Fermer la boîte de dialogue immédiatement
                  setIsDeleteDialogOpen(false);
                  
                  // Appeler la fonction de suppression
                  onDelete(tourId);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                Supprimer
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-6"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}