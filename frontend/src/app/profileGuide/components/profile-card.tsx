"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, ExternalLink, Edit, Star } from "lucide-react"

interface Guide {
  name: string
  email: string
  avatar: string
  location: string
  bio: string
  rating: number
  reviewCount: number
  website?: string
}

interface ProfileCardProps {
  guide: Guide
}

export function ProfileCard({ guide }: ProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: guide.name,
    email: guide.email,
    location: guide.location,
    bio: guide.bio,
    website: guide.website || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log("Updated profile:", formData)
    setIsEditing(false)
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-white dark:border-gray-800 shadow-sm">
            <AvatarImage src={guide.avatar || "/placeholder.svg"} alt={guide.name} />
            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-blue-500 text-white">
              {guide.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{guide.name}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {guide.location}
                </div>
              </div>

              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Profile</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Modifier le profil</DialogTitle>
                    <DialogDescription>
                      Modifiez vos informations de profil ici. Cliquez sur enregistrer lorsque vous avez terminé.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nom
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location" className="text-right">
                        Lieu
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="website" className="text-right">
                        Site Web
                      </Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="bio" className="text-right">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>
                      Enregistrer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center mt-1 gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {guide.rating} ({guide.reviewCount} avis)
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-3.5 w-3.5" />
                <a
                  href={`mailto:${guide.email}`}
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {guide.email}
                </a>
              </div>

              {guide.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <a
                    href={`https://${guide.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1"
                  >
                    {guide.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
