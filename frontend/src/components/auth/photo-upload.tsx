"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Upload, X } from "lucide-react"
import { Label } from "@/components/ui/label"

interface PhotoUploadProps {
  imagePreview: string | null
  onImageChange: (file: File | null) => void
  onPreviewChange: (preview: string | null) => void
  label?: string
  size?: "sm" | "md" | "lg"
  maxSize?: number // in MB
}

export default function PhotoUpload({
  imagePreview,
  onImageChange,
  onPreviewChange,
  label = "Photo de profil",
  size = "md",
  maxSize = 2, // 2MB default
}: PhotoUploadProps) {
  const [error, setError] = useState<string | null>(null)

  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSize * 1024 * 1024) {
      setError(`La taille de l'image ne doit pas dépasser ${maxSize}MB`)
      return
    }

    setError(null)
    onImageChange(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      onPreviewChange(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    onImageChange(null)
    onPreviewChange(null)
    setError(null)
  }

  return (
    <div className="flex flex-col items-center">
      {label && (
        <Label htmlFor="photo-upload" className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </Label>
      )}

      <div className="relative mb-3 group">
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center border-2 transition-all duration-300 ${
            imagePreview ? "border-teal-300" : "border-gray-200 bg-gray-50 group-hover:border-teal-200"
          }`}
        >
          {imagePreview ? (
            <div className="relative w-full h-full">
              <img src={imagePreview || "/placeholder.svg"} alt="Aperçu" className="w-full h-full object-cover" />
              <button
                onClick={removeImage}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/3 -translate-y-1/3 hover:bg-red-600 transition-colors"
                aria-label="Supprimer l'image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-teal-500 transition-colors">
              <Camera className="h-8 w-8 mb-1" />
              <span className="text-xs">Ajouter</span>
            </div>
          )}
        </div>

        {!imagePreview && (
          <label
            htmlFor="photo-upload"
            className="absolute bottom-0 right-0 bg-gradient-to-r from-teal-500 to-teal-400 text-white p-2 rounded-full cursor-pointer hover:shadow-md transition-all duration-300 hover:from-teal-600 hover:to-teal-500"
          >
            <Upload className="h-4 w-4" />
          </label>
        )}

        <input
          id="photo-upload"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : (
        <p className="text-xs text-gray-500">JPG, PNG ou GIF. Max {maxSize}MB.</p>
      )}
    </div>
  )
}
