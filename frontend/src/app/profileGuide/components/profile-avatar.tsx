"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import {
  EnvelopeIcon,
  MapPinIcon,
  PencilIcon,
  AcademicCapIcon,
  BookOpenIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import guideService, { GuideUpdateData } from "@/services/guideService"
import preferenceService from "@/services/preferenceService"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

// Modifier l'interface Guide
interface Guide {
  _id: string
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

// Options for languages selection
const availableLanguages = [
  { id: "Français", label: "Français" },
  { id: "Anglais", label: "Anglais" },
  { id: "Arabe", label: "Arabe" },
  { id: "Espagnol", label: "Espagnol" },
]

// Options for expertise selection
const expertiseOptions = [
  { id: "histoire", label: "Histoire" },
  { id: "culture", label: "Culture" },
  { id: "nature", label: "Nature" },
  { id: "gastronomie", label: "Gastronomie" },
]

// Animation properties
const transitionProps = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
}

export function ProfileAvatar({ guide }: ProfileAvatarProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: guide.name,
    email: guide.email,
    bio: guide.bio || "",
    experience: guide.experience || 0,
  })
  
  // Separate state for languages and expertise as arrays
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(guide.languages || [])
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>(guide.expertise || [])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Fetch guide data from the API when the component mounts
  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        setIsLoading(true)
        // Fetch guide data from the API
        const guideData = await guideService.getGuideById(guide._id)
        
        // Fetch user preferences to get languages
        const preferences = await preferenceService.getUserPreferences(guide._id)
        
        // Update form data with fetched data
        setFormData({
          name: guideData.name || "",
          email: guideData.email || "",
          bio: guideData.bio || guideData.description || "",
          experience: guideData.yearsOfExperience || guideData.experience || 0,
        })
        
        // Update languages and expertise arrays
        if (guideData.languages && guideData.languages.length > 0) {
          setSelectedLanguages(guideData.languages)
        } else if (preferences?.languages && preferences.languages.length > 0) {
          setSelectedLanguages(preferences.languages)
        }
        
        if (guideData.expertise && guideData.expertise.length > 0) {
          setSelectedExpertise(guideData.expertise)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données du guide:", error)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les données du profil.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchGuideData()
  }, [guide._id, toast])
  
  // Vérifier s'il faut afficher le toast après un rafraîchissement
  useEffect(() => {
    // Vérifier si le toast doit être affiché après un rafraîchissement
    const showToast = sessionStorage.getItem('showProfileToast')
    
    if (showToast === 'true') {
      // Afficher le toast
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
        variant: "default",
      })
      
      // Supprimer l'indicateur pour éviter d'afficher le toast à nouveau
      sessionStorage.removeItem('showProfileToast')
    }
  }, [toast]) // Dépendance au hook toast

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      
      // Create a preview URL for the image
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle profile image upload
  const handleImageUpload = async () => {
    if (!profileImage) return
    
    try {
      setUploadingImage(true)
      
      // Create form data for the image upload
      const formData = new FormData()
      formData.append('profileImage', profileImage)
      
      // Get the authentication token
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter et réessayer.",
          variant: "destructive",
        })
        return
      }
      
      // Upload the image directly to the API endpoint
      try {
        // Log the request details for debugging
        console.log('Uploading profile image for user:', guide._id)
        console.log('Image file:', profileImage.name, profileImage.size, 'bytes')
        
        // Make the API request
        const response = await fetch(`http://localhost:5001/api/users/${guide._id}/profile-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })
        
        // Handle the response
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Upload failed with status:', response.status, errorText)
          toast({
            title: "Erreur",
            description: `Impossible de mettre à jour l'image de profil (${response.status}). Veuillez réessayer.`,
            variant: "destructive",
          })
          return
        }
        
        // Parse the successful response
        const data = await response.json()
        console.log('Profile image upload successful:', data)
        
        // Show success toast
        toast({
          title: "Image de profil mise à jour",
          description: "Votre photo de profil a été mise à jour avec succès.",
          variant: "default",
        })
        
        // Set a flag to indicate that the profile was updated
        sessionStorage.setItem('showProfileToast', 'true')
        
        // Refresh the page to show the new image
        setTimeout(() => {
          window.location.reload()
        }, 1000) // Small delay to ensure the toast is seen
      } catch (fetchError) {
        console.error('Fetch error:', fetchError)
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error)
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'image. Veuillez réessayer avec une autre image.",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const guideId = guide._id
      
      // Convert experience to number
      const experience = Number(formData.experience)
      
      // Create FormData object for direct submission
      const formDataObj = new FormData()
      formDataObj.append('name', formData.name)
      formDataObj.append('email', formData.email)
      formDataObj.append('description', formData.bio) // Backend expects 'description' instead of 'bio'
      formDataObj.append('yearsOfExperience', String(experience))
      
      // Add arrays as JSON strings
      formDataObj.append('languages', JSON.stringify(selectedLanguages))
      formDataObj.append('expertise', JSON.stringify(selectedExpertise))
      
      try {
        // Make direct fetch request to the backend
        const response = await fetch(`http://localhost:5001/api/users/guides/${guideId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            description: formData.bio,
            languages: selectedLanguages,
            expertise: selectedExpertise,
            yearsOfExperience: experience
          })
        })
        
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          toast({
            title: "Erreur",
            description: `La mise à jour du profil a échoué (${response.status}). Veuillez réessayer.`,
            variant: "destructive",
          });
          return;
        }
        
        const updatedGuide = await response.json()
        
        // Close the dialog
        setIsEditing(false)
        
        // Update user data in localStorage to reflect changes
        try {
          const storedUserStr = localStorage.getItem("user")
          if (storedUserStr) {
            const storedUser = JSON.parse(storedUserStr)
            const updatedUser = {
              ...storedUser,
              name: formData.name,
              email: formData.email,
              languages: selectedLanguages,
              experience: experience,
              expertise: selectedExpertise,
              bio: formData.bio
            }
            localStorage.setItem("user", JSON.stringify(updatedUser))
            
            // Dispatch an event to notify other components about the user update
            window.dispatchEvent(
              new CustomEvent("userProfileUpdated", {
                detail: updatedUser
              })
            )
          }
        } catch (storageError) {
          console.error("Error updating user data in localStorage:", storageError)
        }
        
        // Stocker les informations de toast dans sessionStorage
        sessionStorage.setItem('showProfileToast', 'true')
        
        // Rafraîchir la page
        window.location.reload()
      } catch (error) {
        console.error("Erreur lors de la mise à jour du guide:", error)
        toast({
          title: "Erreur",
          description: "Les informations du profil n'ont pas pu être mises à jour.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity">
          <Avatar className="h-16 w-16 bg-blue-500 border-2 border-white shadow-md mb-2">
            <AvatarImage src={guide.avatar || "/placeholder.svg"} alt={guide.name} />
            <AvatarFallback className="bg-blue-500 text-white">
              {guide.name.substring(0, 2)}
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
                      <DialogHeader className="pb-2">
                        <DialogTitle className="text-lg">Modifier le profil</DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs">
                          Modifiez vos informations de profil ici.
                        </DialogDescription>
                      </DialogHeader>
                      
                      {/* Profile Image Upload Section */}
                      <div className="flex flex-col items-center mb-2 pt-1">
                        <div className="mb-2 relative">
                          <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                            <AvatarImage 
                              src={previewUrl || guide.avatar || "/placeholder.svg"} 
                              alt={guide.name} 
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-sm">
                              {guide.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Edit button positioned at the bottom right of the avatar */}
                          <label 
                            htmlFor="profile-image-upload" 
                            className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            <PencilIcon className="h-3 w-3 text-gray-600" />
                          </label>
                          
                          <input 
                            type="file" 
                            id="profile-image-upload" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </div>
                        
                        {profileImage && (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">Photo sélectionnée</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleImageUpload}
                              disabled={uploadingImage}
                              className="text-xs py-0 h-6"
                            >
                              {uploadingImage ? (
                                <>
                                  <span className="mr-1 animate-spin">⟳</span>
                                  Télécharger
                                </>
                              ) : (
                                'Enregistrer'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="grid gap-2 py-2">
                        <div className="grid grid-cols-4 items-center gap-2">
                          <Label htmlFor="name" className="text-right text-slate-500 text-xs">
                            Nom
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="col-span-3 h-8 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                          <Label htmlFor="email" className="text-right text-slate-500 text-xs">
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="col-span-3 h-8 text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-2">
                          <Label htmlFor="experience" className="text-right text-slate-500 text-xs">
                            Expérience
                          </Label>
                          <Input
                            id="experience"
                            name="experience"
                            type="number"
                            value={formData.experience}
                            onChange={handleChange}
                            className="col-span-3 h-8 text-sm"
                            placeholder="Années d'expérience"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-2">
                          <Label htmlFor="bio" className="text-right text-slate-500 text-xs">
                            Bio
                          </Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="col-span-3 text-sm min-h-[60px]"
                          />
                        </div>
                        
                        {/* Languages selection */}
                        <div className="grid grid-cols-4 items-start gap-2 mt-3">
                          <Label className="text-right text-slate-500 pt-1 text-xs">
                            Langues parlées
                          </Label>
                          <div className="col-span-3">
                            <div className="flex flex-wrap gap-1">
                              {availableLanguages.map((language) => {
                                const isSelected = selectedLanguages.includes(language.id);
                                return (
                                  <button
                                    key={language.id}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedLanguages(selectedLanguages.filter(lang => lang !== language.id));
                                      } else {
                                        setSelectedLanguages([...selectedLanguages, language.id]);
                                      }
                                    }}
                                    className={`
                                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                      whitespace-nowrap overflow-hidden ring-1 ring-inset transition-colors
                                      ${isSelected ? "bg-blue-50 text-blue-700 ring-blue-200" : "text-slate-600 ring-slate-200 hover:bg-slate-50"}
                                    `}
                                  >
                                    <div className="relative flex items-center">
                                      <span>{language.label}</span>
                                      {isSelected && (
                                        <span className="ml-1">
                                          <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Check className="w-2 h-2 text-white" strokeWidth={3} />
                                          </div>
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expertise selection */}
                        <div className="grid grid-cols-4 items-start gap-2 mt-2">
                          <Label className="text-right text-slate-500 pt-1 text-xs">
                            Domaines d'expertise
                          </Label>
                          <div className="col-span-3">
                            <div className="flex flex-wrap gap-1">
                              {expertiseOptions.map((option) => {
                                const isSelected = selectedExpertise.includes(option.id);
                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedExpertise(selectedExpertise.filter(exp => exp !== option.id));
                                      } else {
                                        setSelectedExpertise([...selectedExpertise, option.id]);
                                      }
                                    }}
                                    className={`
                                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                      whitespace-nowrap overflow-hidden ring-1 ring-inset transition-colors
                                      ${isSelected ? "bg-blue-50 text-blue-700 ring-blue-200" : "text-slate-600 ring-slate-200 hover:bg-slate-50"}
                                    `}
                                  >
                                    <div className="relative flex items-center">
                                      <span>{option.label}</span>
                                      {isSelected && (
                                        <span className="ml-1">
                                          <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Check className="w-2 h-2 text-white" strokeWidth={3} />
                                          </div>
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={handleSubmit}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? "Enregistrement..." : "Enregistrer"}
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
                    <span>{(guide.languages || []).join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <AcademicCapIcon className="h-3.5 w-3.5" />
                    <span>{guide.experience} ans d'expérience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <BookOpenIcon className="h-3.5 w-3.5" />
                    <span>{(guide.expertise || []).join(", ")}</span>
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
