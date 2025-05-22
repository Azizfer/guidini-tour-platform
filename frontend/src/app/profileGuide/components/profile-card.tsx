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
import { Mail, MapPin, ExternalLink, Edit, Star, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import guideService, { Guide as ApiGuide, GuideUpdateData } from "@/services/guideService"
import preferenceService from "@/services/preferenceService"

// Interface pour le guide avec toutes les propriétés optionnelles pour éviter les erreurs TypeScript
interface Guide {
  _id: string
  name: string
  email: string
  avatar?: string
  location?: string
  bio?: string
  rating?: number
  reviewCount?: number
  website?: string
  expertise?: string[]
  languages?: string[]
}

interface ProfileCardProps {
  guide: Guide
}

export function ProfileCard({ guide }: ProfileCardProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Initialiser les données du formulaire avec les données du guide
  const [formData, setFormData] = useState({
    name: guide.name || "",
    email: guide.email || "",
    bio: guide.bio || "",
    website: guide.website || "",
    expertise: guide.expertise?.join(", ") || "",
    languages: guide.languages?.join(", ") || "",
    location: guide.location || "Tunisie"
  })
  
  // Mettre à jour les données du formulaire quand les données du guide changent
  useEffect(() => {
    console.log("Les données du guide ont changé:", guide);
    setFormData({
      name: guide.name || "",
      email: guide.email || "",
      bio: guide.bio || "",
      website: guide.website || "",
      expertise: guide.expertise?.join(", ") || "",
      languages: guide.languages?.join(", ") || "",
      location: guide.location || "Tunisie"
    });
  }, [guide])
  
  // Récupérer les langues depuis les préférences
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true);
        console.log("Récupération des préférences...");
        
        // Récupérer les préférences de l'utilisateur
        const preferences = await preferenceService.getUserPreferences(guide._id);
        console.log("Préférences récupérées pour l'utilisateur ", guide._id, ":", preferences);
        
        if (preferences && preferences.languages && preferences.languages.length > 0) {
          // Mettre à jour le formulaire avec les langues des préférences
          setFormData(prev => ({
            ...prev,
            languages: preferences.languages.join(", ")
          }));
          console.log("Langues définies dans le formulaire:", preferences.languages.join(", "));
        } else {
          console.log("Aucune langue trouvée dans les préférences");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des langues:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les langues. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLanguages();
  }, [toast, guide._id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const guideId = guide._id
      console.log("ID du guide pour la mise à jour:", guideId)
      
      // Convertir les langues depuis le formulaire en tableau
      const languages = formData.languages.split(",").map(item => item.trim()).filter(item => item !== "")
      console.log("Langues à mettre à jour:", languages)
      
      // Préparer les données pour la mise à jour
      const updateData: GuideUpdateData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio, // Sera converti en description dans le backend
        website: formData.website,
        location: formData.location,
        expertise: formData.expertise.split(",").map(item => item.trim()).filter(item => item !== "")
      }
      
      console.log("Données à envoyer pour la mise à jour:", updateData)
      
      // Étape 1: Mettre à jour les langues (si modifiées)
      console.log("1. Mise à jour des langues...")
      try {
        if (languages.length > 0) {
          console.log("Envoi de la mise à jour des langues à l'API...")
          await preferenceService.updateUserPreferences(guideId, { languages })
          console.log("Langues mises à jour avec succès")
        }
      } catch (prefError) {
        console.error("Erreur lors de la mise à jour des préférences:", prefError)
        // Afficher un toast d'erreur mais continuer avec la mise à jour du guide
        toast({
          title: "Attention",
          description: "Les langues n'ont pas pu être mises à jour. Les autres informations seront enregistrées.",
          variant: "destructive",
        })
      }
      
      // Étape 2: Mettre à jour les informations du guide
      console.log("2. Envoi de la mise à jour du guide à l'API...")
      const updatedGuide = await guideService.updateGuide(guideId, updateData)
      console.log("Réponse de l'API pour la mise à jour du guide:", updatedGuide)
      
      // Afficher un toast de succès
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès. La page va se recharger.",
        variant: "default",
      })
      
      // Fermer la boîte de dialogue
      setIsEditing(false)
      
      // Recharger la page après un court délai pour voir les changements
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      
      // Afficher un toast d'erreur
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white" data-guide-name>{guide.name}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <span data-guide-location>{guide.location}</span>
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
                        placeholder="Tunisie"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="languages" className="text-right">
                        Langues
                      </Label>
                      <Input
                        id="languages"
                        name="languages"
                        value={formData.languages}
                        onChange={handleChange}
                        className="col-span-3"
                        placeholder="Français, Anglais, Arabe (séparés par des virgules)"
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="expertise" className="text-right">
                        Domaines d'expertise
                      </Label>
                      <Input
                        id="expertise"
                        name="expertise"
                        value={formData.expertise}
                        onChange={handleChange}
                        className="col-span-3"
                        placeholder="Histoire, Culture, Gastronomie (séparés par des virgules)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        "Enregistrer"
                      )}
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
                  data-guide-email
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
