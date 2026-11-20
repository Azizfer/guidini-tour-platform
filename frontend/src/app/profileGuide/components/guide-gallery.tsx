"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline"
import { Badge } from "@/components/ui/badge"

// Données fictives pour la galerie
const mockGalleryImages = [
  {
    id: "1",
    url: "/placeholder.svg?height=300&width=400",
    title: "Médina de Sousse",
    tourId: "1",
    tourName: "Visite historique de la Médina de Sousse",
    date: "2023-06-15",
  },
  {
    id: "2",
    url: "/placeholder.svg?height=300&width=400",
    title: "Ribat de Monastir",
    tourId: "2",
    tourName: "Visite du Ribat et du Mausolée de Monastir",
    date: "2023-06-20",
  },
  {
    id: "3",
    url: "/placeholder.svg?height=300&width=400",
    title: "Plage de Sousse",
    tourId: "3",
    tourName: "Expérience plage à Sousse",
    date: "2023-06-25",
  },
]

// Données fictives pour les visites (pour la liste déroulante)
const mockTours = [
  { id: "1", title: "Visite historique de la Médina de Sousse" },
  { id: "2", title: "Visite du Ribat et du Mausolée de Monastir" },
  { id: "3", title: "Expérience plage à Sousse" },
]

export default function GuideGallery() {
  const [images, setImages] = useState(mockGalleryImages)
  const [isAddImageOpen, setIsAddImageOpen] = useState(false)
  const [newImage, setNewImage] = useState({
    title: "",
    tourId: "",
  })

  const handleAddImage = () => {
    const image = {
      id: (images.length + 1).toString(),
      url: "/placeholder.svg?height=300&width=400",
      title: newImage.title,
      tourId: newImage.tourId,
      tourName: mockTours.find((tour) => tour.id === newImage.tourId)?.title || "",
      date: new Date().toISOString().split("T")[0],
    }
    setImages([...images, image])
    setIsAddImageOpen(false)
    setNewImage({
      title: "",
      tourId: "",
    })
  }

  const deleteImage = (id: string) => {
    setImages(images.filter((image) => image.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Ma Galerie</h2>
        <Dialog open={isAddImageOpen} onOpenChange={setIsAddImageOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all">
              <PlusIcon className="h-4 w-4" />
              Ajouter une image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">Ajouter une image</DialogTitle>
              <DialogDescription className="text-gray-600">
                Téléchargez une nouvelle image et associez-la à un tour.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="imageTitle" className="text-sm font-medium text-gray-700">
                  Titre de l'image
                </Label>
                <Input
                  id="imageTitle"
                  placeholder="Entrez le titre de l'image"
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                  className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tourSelect" className="text-sm font-medium text-gray-700">
                  Tour associé
                </Label>
                <Select value={newImage.tourId} onValueChange={(value) => setNewImage({ ...newImage, tourId: value })}>
                  <SelectTrigger
                    id="tourSelect"
                    className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <SelectValue placeholder="Sélectionnez un tour" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTours.map((tour) => (
                      <SelectItem key={tour.id} value={tour.id}>
                        {tour.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageFile" className="text-sm font-medium text-gray-700">
                  Fichier image
                </Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddImageOpen(false)}
                className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button onClick={handleAddImage} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card
            key={image.id}
            className="overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl"
          >
            <div className="relative">
              <img src={image.url || "/placeholder.svg"} alt={image.title} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                <p className="text-white/90 text-sm">{image.tourName}</p>
              </div>
              <Badge className="absolute top-3 right-3 bg-blue-600 text-white border-0">
                {new Date(image.date).toLocaleDateString()}
              </Badge>
            </div>
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <PhotoIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600 truncate">{image.tourName}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteImage(image.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full h-8 w-8"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
