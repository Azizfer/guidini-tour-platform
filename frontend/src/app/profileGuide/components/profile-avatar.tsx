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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  EnvelopeIcon,
  MapPinIcon,
  PencilIcon,
  AcademicCapIcon,
  BookOpenIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"

// Modifier l'interface Guide
interface Guide {
  name: string
  email: string
  avatar?: string
  location?: string
  bio?: string
  rating?: number
  reviewCount?: number
  languages?: string[]
  experience?: number
  expertise?: string[]
}

interface ProfileAvatarProps {
  guide: Guide
}

export function ProfileAvatar({ guide }: ProfileAvatarProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: guide.name,
    email: guide.email,
    location: guide.location || "Tunisie",
    bio: guide.bio || "",
    languages: (guide.languages || []).join(", "),
    experience: guide.experience || 0,
    expertise: (guide.expertise || []).join(", "),
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
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity">
          <Avatar className="h-16 w-16 bg-blue-500 border-2 border-white shadow-md mb-2">
            <AvatarImage src={guide.avatar || "/placeholder.svg"} alt={guide.name} />
            <AvatarFallback className="bg-blue-500 text-white">
              Ah
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-slate-900 mb-2">{guide.name}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-white border border-slate-200 shadow-xl" align="center">
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                <AvatarImage src={guide.avatar || "/placeholder.svg"} alt={guide.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                  {guide.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{guide.name}</h2>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPinIcon className="h-3.5 w-3.5" />
                      {guide.location}
                    </div>
                  </div>

                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">Edit Profile</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white">
                      <DialogHeader>
                        <DialogTitle>Modifier le profil</DialogTitle>
                        <DialogDescription className="text-slate-500">
                          Modifiez vos informations de profil ici. Cliquez sur enregistrer lorsque vous avez terminé.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right text-slate-500">
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
                          <Label htmlFor="email" className="text-right text-slate-500">
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
                          <Label htmlFor="location" className="text-right text-slate-500">
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
                          <Label htmlFor="languages" className="text-right text-slate-500">
                            Langues
                          </Label>
                          <Input
                            id="languages"
                            name="languages"
                            value={formData.languages}
                            onChange={handleChange}
                            className="col-span-3"
                            placeholder="Français, Anglais, Arabe..."
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="experience" className="text-right text-slate-500">
                            Expérience
                          </Label>
                          <Input
                            id="experience"
                            name="experience"
                            type="number"
                            value={formData.experience}
                            onChange={handleChange}
                            className="col-span-3"
                            placeholder="Années d'expérience"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="expertise" className="text-right text-slate-500">
                            Expertise
                          </Label>
                          <Input
                            id="expertise"
                            name="expertise"
                            value={formData.expertise}
                            onChange={handleChange}
                            className="col-span-3"
                            placeholder="Histoire, Culture, Gastronomie..."
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="bio" className="text-right text-slate-500">
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
                        <Button
                          type="submit"
                          onClick={handleSubmit}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Enregistrer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center mt-1 gap-1">
                  <StarIconSolid className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-slate-700">
                    {guide.rating} ({guide.reviewCount} avis)
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <EnvelopeIcon className="h-3.5 w-3.5" />
                    <a href={`mailto:${guide.email}`} className="hover:text-blue-600 transition-colors">
                      {guide.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <LanguageIcon className="h-3.5 w-3.5" />
                    <span>{guide.languages.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <AcademicCapIcon className="h-3.5 w-3.5" />
                    <span>{guide.experience} ans d'expérience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <BookOpenIcon className="h-3.5 w-3.5" />
                    <span>{guide.expertise.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
