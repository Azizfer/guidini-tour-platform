"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface AddMemoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tourTitle?: string
}

export default function AddMemoryDialog({ open, onOpenChange, tourTitle }: AddMemoryDialogProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedImages((prev) => [...prev, ...files].slice(0, 5))
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    console.log("Adding memory for tour:", tourTitle)
    console.log("Images:", selectedImages)
    setSelectedImages([])
    onOpenChange(false)
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
              disabled={selectedImages.length === 0}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Publier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
