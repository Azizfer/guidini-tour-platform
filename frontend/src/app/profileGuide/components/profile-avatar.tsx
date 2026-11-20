"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { Badge } from "@/components/ui/badge"
import {
  EnvelopeIcon,
  MapPinIcon,
  PencilIcon,
  AcademicCapIcon,
  BookOpenIcon,
  LanguageIcon,
  CameraIcon,
} from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"
import guideService from "@/services/guideService"
import preferenceService from "@/services/preferenceService"
import { Check, Upload } from "lucide-react"
import { getGuideStats } from "@/services/guideStatsService"

// Modifier l'interface Guide
interface Guide {
  _id: string
  name: string
  email: string
  avatar?: string
  profileImage?: string // Cloudinary URL
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

  // New local state for rating & reviews so that we can update them after fetching
  const [rating, setRating] = useState<number>(guide.rating || 0)
  const [reviewCount, setReviewCount] = useState<number>(guide.reviewCount || 0)

  // Separate state for languages and expertise as arrays
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(guide.languages || [])
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>(guide.expertise || [])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Fetch guide data from the API when the component mounts
  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        setIsLoading(true)
        const guideData = await guideService.getGuideById(guide._id)

        const preferences = await preferenceService.getUserPreferences(guide._id)

        setFormData({
          name: guideData.name || "",
          email: guideData.email || "",
          bio: guideData.bio || guideData.description || "",
          experience: guideData.yearsOfExperience || guideData.experience || 0,
        })

        // Fetch statistics (rating & review count) separately to ensure accurate data
        try {
          const stats = await getGuideStats(guide._id)
          if (typeof stats.rating === "number") {
            setRating(stats.rating)
          }
          if (typeof stats.reviewCount === "number") {
            setReviewCount(stats.reviewCount)
          }
        } catch (statsError) {
          /* eslint-disable-next-line no-console */
          console.error("Erreur lors de la récupération des statistiques du guide:", statsError)
        }

        if (guideData.languages && guideData.languages.length > 0) {
          setSelectedLanguages(guideData.languages)
        } else if (preferences?.languages && preferences.languages.length > 0) {
          setSelectedLanguages(preferences.languages)
        }

        if (guideData.expertise && guideData.expertise.length > 0) {
          setSelectedExpertise(guideData.expertise)
        }
      } catch (error) {
        /* eslint-disable-next-line no-console */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Vérifier s'il faut afficher le toast après un rafraîchissement
  useEffect(() => {
    const showToast = sessionStorage.getItem("showProfileToast")

    if (showToast === "true") {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
        variant: "default",
      })

      sessionStorage.removeItem("showProfileToast")
    }
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)

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

      const formData = new FormData()
      formData.append("profileImage", profileImage)

      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter et réessayer.",
          variant: "destructive",
        })
        return
      }

      try {
        const response = await fetch(`http://localhost:5001/api/users/${guide._id}/profile-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          /* eslint-disable-next-line no-console */
          console.error("Upload failed with status:", response.status, errorText)
          toast({
            title: "Erreur",
            description: `Impossible de mettre à jour l'image de profil (${response.status}). Veuillez réessayer.`,
            variant: "destructive",
          })
          return
        }

        const data = await response.json()
        /* eslint-disable-next-line no-console */
        console.log("Profile image upload successful:", data)

        toast({
          title: "Image de profil mise à jour",
          description: "Votre photo de profil a été mise à jour avec succès.",
          variant: "default",
        })

        sessionStorage.setItem("showProfileToast", "true")

        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (fetchError) {
        /* eslint-disable-next-line no-console */
        console.error("Fetch error:", fetchError)
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet.",
          variant: "destructive",
        })
      }
    } catch (error) {
      /* eslint-disable-next-line no-console */
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

      const experience = Number(formData.experience)

      try {
        const response = await fetch(`http://localhost:5001/api/users/guides/${guideId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            description: formData.bio,
            languages: selectedLanguages,
            expertise: selectedExpertise,
            yearsOfExperience: experience,
          }),
        })

        if (!response.ok) {
          /* eslint-disable-next-line no-console */
          console.error(`HTTP error! status: ${response.status}`)
          toast({
            title: "Erreur",
            description: `La mise à jour du profil a échoué (${response.status}). Veuillez réessayer.`,
            variant: "destructive",
          })
          return
        }

        const updatedGuide = await response.json()

        setIsEditing(false)

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
              bio: formData.bio,
            }
            localStorage.setItem("user", JSON.stringify(updatedUser))

            window.dispatchEvent(
              new CustomEvent("userProfileUpdated", {
                detail: updatedUser,
              }),
            )
          }
        } catch (storageError) {
          /* eslint-disable-next-line no-console */
          console.error("Error updating user data in localStorage:", storageError)
        }

        sessionStorage.setItem("showProfileToast", "true")
        window.location.reload()
      } catch (error) {
        /* eslint-disable-next-line no-console */
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
      /* eslint-disable-next-line no-console */
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
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <motion.div
          className="flex flex-col items-center cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <Avatar className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white shadow-lg mb-3 group-hover:shadow-xl transition-shadow">
              <AvatarImage
                src={previewUrl || guide.avatar || guide.profileImage || "/placeholder.svg"}
                alt={guide.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                {guide.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {guide.name}
          </span>
          <span className="text-xs text-gray-500">Guide certifié</span>
        </motion.div>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 bg-white border border-gray-200 shadow-xl rounded-xl" align="center">
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="p-0">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-t-xl">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                    <AvatarImage
                      src={previewUrl || guide.avatar || guide.profileImage || "/placeholder.svg"}
                      alt={guide.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                      {guide.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{guide.name}</h2>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {guide.location}
                      </div>
                    </div>

                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-gray-300 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full shadow-sm"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit Profile</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[380px] bg-white max-h-[85vh] overflow-y-auto">
                        <DialogHeader className="pb-4">
                          <DialogTitle className="text-xl font-bold text-gray-900">Modifier le profil</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Mettez à jour vos informations personnelles et professionnelles.
                          </DialogDescription>
                        </DialogHeader>

                        {/* Profile Image Upload Section */}
                        <div className="flex flex-col items-center mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="relative mb-4">
                            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                              <AvatarImage
                                src={previewUrl || guide.avatar || guide.profileImage || "/placeholder.svg"}
                                alt={guide.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white text-lg">
                                {guide.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>

                            <label
                              htmlFor="profile-image-upload"
                              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200"
                            >
                              <CameraIcon className="h-4 w-4 text-gray-600" />
                            </label>

                            <input
                              type="file"
                              id="profile-image-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </div>

                          <AnimatePresence>
                            {profileImage && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-3"
                              >
                                <p className="text-sm text-gray-600">Photo sélectionnée</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleImageUpload}
                                  disabled={uploadingImage}
                                  className="text-sm py-1 h-8 rounded-lg"
                                >
                                  {uploadingImage ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-gray-600 mr-2"></div>
                                      Télécharger
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-3 w-3 mr-1" />
                                      Enregistrer
                                    </>
                                  )}
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="grid gap-3 py-2">
                          <div className="grid grid-cols-4 items-center gap-2">
                            <Label htmlFor="name" className="text-right text-gray-700 text-sm font-medium">
                              Nom
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="col-span-3 h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-2">
                            <Label htmlFor="email" className="text-right text-gray-700 text-sm font-medium">
                              Email
                            </Label>
                            <Input
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="col-span-3 h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-4 items-center gap-2">
                            <Label htmlFor="experience" className="text-right text-gray-700 text-sm font-medium">
                              Expérience
                            </Label>
                            <Input
                              id="experience"
                              name="experience"
                              type="number"
                              value={formData.experience}
                              onChange={handleChange}
                              className="col-span-3 h-9 text-sm rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Années d'expérience"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-start gap-2">
                            <Label htmlFor="bio" className="text-right text-gray-700 text-sm font-medium pt-2">
                              Bio
                            </Label>
                            <Textarea
                              id="bio"
                              name="bio"
                              value={formData.bio}
                              onChange={handleChange}
                              className="col-span-3 text-sm min-h-[80px] rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          {/* Languages selection */}
                          <div className="grid grid-cols-4 items-start gap-2 mt-4">
                            <Label className="text-right text-gray-700 pt-2 text-sm font-medium">Langues</Label>
                            <div className="col-span-3">
                              <div className="flex flex-wrap gap-2">
                                {availableLanguages.map((language) => {
                                  const isSelected = selectedLanguages.includes(language.id)
                                  return (
                                    <motion.button
                                      key={language.id}
                                      type="button"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => {
                                        if (isSelected) {
                                          setSelectedLanguages(selectedLanguages.filter((lang) => lang !== language.id))
                                        } else {
                                          setSelectedLanguages([...selectedLanguages, language.id])
                                        }
                                      }}
                                      className={`
                                        inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                                        transition-all duration-200 border
                                        ${
                                          isSelected
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                                        }
                                      `}
                                    >
                                      <span>{language.label}</span>
                                      {isSelected && <Check className="w-3 h-3 ml-1" strokeWidth={3} />}
                                    </motion.button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Expertise selection */}
                          <div className="grid grid-cols-4 items-start gap-2 mt-2">
                            <Label className="text-right text-gray-700 pt-2 text-sm font-medium">Expertise</Label>
                            <div className="col-span-3">
                              <div className="flex flex-wrap gap-2">
                                {expertiseOptions.map((option) => {
                                  const isSelected = selectedExpertise.includes(option.id)
                                  return (
                                    <motion.button
                                      key={option.id}
                                      type="button"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => {
                                        if (isSelected) {
                                          setSelectedExpertise(selectedExpertise.filter((exp) => exp !== option.id))
                                        } else {
                                          setSelectedExpertise([...selectedExpertise, option.id])
                                        }
                                      }}
                                      className={`
                                        inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                                        transition-all duration-200 border
                                        ${
                                          isSelected
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                                        }
                                      `}
                                    >
                                      <span>{option.label}</span>
                                      {isSelected && <Check className="w-3 h-3 ml-1" strokeWidth={3} />}
                                    </motion.button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogFooter className="pt-6 border-t border-gray-200">
                          <Button
                            type="submit"
                            onClick={handleSubmit}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Enregistrement...
                              </>
                            ) : (
                              "Enregistrer les modifications"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex items-center mt-2 gap-1">
                    <StarIconSolid className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-gray-700 font-medium">
                      {rating.toFixed(1)} ({reviewCount} avis)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                  <a href={`mailto:${guide.email}`} className="hover:text-blue-600 transition-colors">
                    {guide.email}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <LanguageIcon className="h-4 w-4 text-gray-500" />
                  <div className="flex flex-wrap gap-1">
                    {(guide.languages || []).map((language, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-300 text-gray-600">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AcademicCapIcon className="h-4 w-4 text-gray-500" />
                  <span>{guide.experience} ans d'expérience</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpenIcon className="h-4 w-4 text-gray-500" />
                  <div className="flex flex-wrap gap-1">
                    {(guide.expertise || []).map((exp, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-300 text-gray-600">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {guide.bio && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 italic">"{guide.bio}"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
