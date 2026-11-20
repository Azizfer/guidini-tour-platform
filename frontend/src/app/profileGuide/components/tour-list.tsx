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
  CheckCircleIcon,
} from "@heroicons/react/24/outline"
import type { Tour } from "@/services/toursService"
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
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)

  // Filtrer les tours en fonction de l'onglet actif
  const filteredTours = tours.filter((tour) => {
    if (activeTab === "active") return tour.tourStatus === "active"
    if (activeTab === "completed") return tour.tourStatus === "completed"
    if (activeTab === "private") return tour.tourStatus === "private"
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

  // Gérer la sauvegarde d'un tour modifié
  const handleTourSaved = (updatedTour: Tour) => {
    onTourUpdated(updatedTour)
    setIsEditDialogOpen(false)
    setSelectedTour(null)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border border-gray-200 rounded-lg p-1">
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600 rounded-md transition-all"
              >
                Actifs
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600 rounded-md transition-all"
              >
                Complétés
              </TabsTrigger>
              <TabsTrigger
                value="private"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-600 rounded-md transition-all"
              >
                Privés
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="p-6 mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 ml-3">Chargement des tours...</p>
              </div>
            ) : filteredTours.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-40 gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <CalendarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-center">
                  Aucun tour {activeTab === "active" ? "actif" : activeTab === "completed" ? "complété" : "privé"}{" "}
                  trouvé
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTours.map((tour, index) => (
                  <TourCard
                    key={`${tour._id || tour.id}-${index}`}
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
      </div>

      {/* Dialogue d'édition de tour */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Modifier le tour</DialogTitle>
          </DialogHeader>
          {selectedTour && (
            <TourEditForm tour={selectedTour} onSave={handleTourSaved} onCancel={handleCloseEditDialog} />
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <Card className="overflow-hidden flex flex-col h-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
      {tour.image && (
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={tour.image.startsWith("/") || tour.image.startsWith("http") ? tour.image : `/uploads/${tour.image}`}
            alt={tour.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Tour+Image"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      )}

      <CardHeader className="pb-3 flex-grow-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{tour.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              >
                <EllipsisHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {tour.tourStatus !== "completed" && (
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => onToggleVisibility(tourId)}
                >
                  {tour.tourStatus === "active" ? (
                    <>
                      <EyeSlashIcon className="h-4 w-4" />
                      <span>Passer en privé</span>
                    </>
                  ) : tour.tourStatus === "private" ? (
                    <>
                      <EyeIcon className="h-4 w-4" />
                      <span>Passer en public</span>
                    </>
                  ) : null}
                </DropdownMenuItem>
              )}
              {tour.tourStatus === "active" && (
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    const event = new CustomEvent("tourStatusChanged", {
                      detail: { tourId, status: "completed" },
                    })
                    window.dispatchEvent(event)
                  }}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Marquer comme complété</span>
                </DropdownMenuItem>
              )}
              {tour.tourStatus !== "completed" && (
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
        <CardDescription className="text-gray-500 flex items-center gap-1">
          <TagIcon className="h-3 w-3" />
          {tour.location} • {tour.duration}
        </CardDescription>
      </CardHeader>

      <CardContent className="py-3 flex-grow space-y-3">
        <p className="text-gray-700 line-clamp-2 text-sm">{tour.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{tour.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{tour.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UsersIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Max: {tour.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TagIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{Array.isArray(tour.category) ? tour.category[0] : tour.category}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex-grow-0 flex justify-between items-center border-t border-gray-100">
        <div className="text-lg font-semibold text-gray-900">{tour.price} TND</div>
        <div className="flex items-center gap-1">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              tour.tourStatus === "active"
                ? "bg-blue-100 text-blue-800"
                : tour.tourStatus === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {tour.tourStatus === "active" ? "Actif" : tour.tourStatus === "completed" ? "Complété" : "Privé"}
          </span>
        </div>
      </CardFooter>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDeleteDialogOpen(false)}></div>
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer le tour</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce tour ? Cette action est irréversible.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                onClick={async () => {
                  if (!tourId) return
                  setIsDeleteDialogOpen(false)
                  onDelete(tourId)
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
