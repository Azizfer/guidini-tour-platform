"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { toast } from "@/components/ui/use-toast"

interface AddMemoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tourTitle?: string
  onMemoriesAdded?: (urls: string[]) => void
}

export default function AddMemoryDialog({ open, onOpenChange, tourTitle, onMemoriesAdded }: AddMemoryDialogProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedImages((prev) => [...prev, ...files].slice(0, 5))
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (selectedImages.length === 0) return
    setLoading(true)
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim()
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim()
    if (!cloudName || !uploadPreset) {
      toast({ title: 'Configuration manquante', description: 'Cloudinary n\'est pas configuré.', variant: 'destructive' })
      setLoading(false)
      return
    }
    try {
      const uploadedUrls: string[] = []
      for (const file of selectedImages) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)
        formData.append('folder', 'guidini/Souvenirs')
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) {
          const errData = await res.json();
          console.error('Cloudinary error:', errData);
          throw new Error(errData.error?.message || 'Upload failed');
        }
        const data = await res.json()
        if (data.secure_url) uploadedUrls.push(data.secure_url)
      }
      toast({ title: 'Souvenirs ajoutés', description: `${uploadedUrls.length} image(s) publiée(s).` })
      onMemoriesAdded?.(uploadedUrls)
    } catch (err: any) {
      console.error('Upload error', err)
      toast({ title: 'Erreur', description: `Échec du téléchargement: ${err.message}`, variant: 'destructive' })
    } finally {
      setLoading(false)
      setSelectedImages([])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Ajouter des souvenirs</DialogTitle>
          {tourTitle && <p className="text-sm text-gray-600">{tourTitle}</p>}
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Photos (max 5)</Label>

            <div className="grid grid-cols-3 gap-3">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image) || "/placeholder.svg"}
                    alt={`Memory ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 text-xs"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {selectedImages.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 h-20 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500">+</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedImages.length === 0 || loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Publication...' : 'Publier'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
