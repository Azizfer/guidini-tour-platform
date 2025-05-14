"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  ChevronDown,
  Star,
  Award,
  MessageCircle,
  Calendar,
  Languages,
  MapPin,
  Mail,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Extended guides data from the PopularGuides component
const guides = [
  {
    id: 1,
    name: "Ahmed",
    specialty: "Histoire & Culture",
    rating: 4.9,
    reviews: 127,
    image: "/placeholder.svg?height=400&width=400&text=Ahmed",
    languages: ["Français", "Anglais", "Arabe"],
    experience: "5 ans",
    bio: "Passionné d'histoire tunisienne, Ahmed vous fera découvrir les trésors cachés de notre patrimoine culturel.",
    location: "Tunis",
    availability: "Disponible",
    responseTime: "2h",
    specialties: ["Sites archéologiques", "Musées", "Monuments historiques"],
    tours: ["Carthage et Sidi Bou Said", "Médina de Tunis", "Musée du Bardo"],
  },
  {
    id: 2,
    name: "Sarah",
    specialty: "Gastronomie",
    rating: 4.8,
    reviews: 98,
    image: "/placeholder.svg?height=400&width=400&text=Sarah",
    languages: ["Français", "Anglais", "Italien"],
    experience: "3 ans",
    bio: "Experte en cuisine tunisienne, Sarah vous emmène dans un voyage culinaire à travers les saveurs locales.",
    location: "Sousse",
    availability: "Disponible",
    responseTime: "1h",
    specialties: ["Cuisine traditionnelle", "Marchés locaux", "Ateliers culinaires"],
    tours: ["Tour gastronomique de Sousse", "Atelier de pâtisserie tunisienne", "Dégustation d'huile d'olive"],
  },
  {
    id: 3,
    name: "Mohamed",
    specialty: "Aventure",
    rating: 4.9,
    reviews: 156,
    image: "/placeholder.svg?height=400&width=400&text=Mohamed",
    languages: ["Français", "Anglais", "Espagnol"],
    experience: "7 ans",
    bio: "Guide d'aventure expérimenté, Mohamed connaît les meilleurs spots pour des expériences inoubliables.",
    location: "Djerba",
    availability: "Disponible",
    responseTime: "3h",
    specialties: ["Randonnée", "Sports nautiques", "Camping dans le désert"],
    tours: ["Trek dans les montagnes", "Excursion en quad dans le désert", "Plongée à Djerba"],
  },
  {
    id: 4,
    name: "Leila",
    specialty: "Art & Artisanat",
    rating: 4.7,
    reviews: 84,
    image: "/placeholder.svg?height=400&width=400&text=Leila",
    languages: ["Français", "Anglais", "Allemand"],
    experience: "4 ans",
    bio: "Artiste dans l'âme, Leila vous fait découvrir les ateliers d'artisans et les galeries d'art locales.",
    location: "Sidi Bou Said",
    availability: "Disponible",
    responseTime: "4h",
    specialties: ["Poterie", "Peinture", "Tissage traditionnel"],
    tours: ["Ateliers d'artisans de Sidi Bou Said", "Galeries d'art de Tunis", "Initiation à la poterie"],
  },
  {
    id: 5,
    name: "Karim",
    specialty: "Plongée & Sports nautiques",
    rating: 5.0,
    reviews: 112,
    image: "/placeholder.svg?height=400&width=400&text=Karim",
    languages: ["Français", "Anglais", "Arabe"],
    experience: "6 ans",
    bio: "Instructeur de plongée certifié, Karim vous emmène explorer les fonds marins de la Méditerranée.",
    location: "Tabarka",
    availability: "Disponible",
    responseTime: "2h",
    specialties: ["Plongée sous-marine", "Snorkeling", "Voile"],
    tours: ["Plongée à Tabarka", "Excursion en bateau", "Initiation au kitesurf"],
  },
  {
    id: 6,
    name: "Yasmine",
    specialty: "Bien-être & Spa",
    rating: 4.9,
    reviews: 78,
    image: "/placeholder.svg?height=400&width=400&text=Yasmine",
    languages: ["Français", "Anglais", "Arabe"],
    experience: "4 ans",
    bio: "Spécialiste du bien-être, Yasmine vous guide vers les meilleurs spas et centres de relaxation de Tunisie.",
    location: "Hammamet",
    availability: "Disponible",
    responseTime: "2h",
    specialties: ["Hammam traditionnel", "Massage", "Yoga"],
    tours: ["Journée spa à Hammamet", "Retraite yoga", "Hammam et gommage traditionnel"],
  },
  {
    id: 7,
    name: "Nabil",
    specialty: "Photographie",
    rating: 4.8,
    reviews: 92,
    image: "/placeholder.svg?height=400&width=400&text=Nabil",
    languages: ["Français", "Anglais", "Arabe"],
    experience: "5 ans",
    bio: "Photographe professionnel, Nabil vous emmène dans les lieux les plus photogéniques de Tunisie.",
    location: "Tunis",
    availability: "Disponible",
    responseTime: "3h",
    specialties: ["Paysages", "Architecture", "Portraits"],
    tours: ["Safari photo dans le désert", "Coucher de soleil à Sidi Bou Said", "Médina de Tunis en images"],
  },
  {
    id: 8,
    name: "Amira",
    specialty: "Traditions & Folklore",
    rating: 4.7,
    reviews: 65,
    image: "/placeholder.svg?height=400&width=400&text=Amira",
    languages: ["Français", "Anglais", "Arabe"],
    experience: "3 ans",
    bio: "Passionnée par les traditions tunisiennes, Amira vous fait découvrir le folklore et les coutumes locales.",
    location: "Kairouan",
    availability: "Disponible",
    responseTime: "4h",
    specialties: ["Danses traditionnelles", "Festivals", "Cérémonies"],
    tours: ["Soirée folklorique", "Festival de Douz", "Visite de Kairouan"],
  },
]

const specialties = [
  "Toutes",
  "Histoire & Culture",
  "Gastronomie",
  "Aventure",
  "Art & Artisanat",
  "Plongée & Sports nautiques",
  "Bien-être & Spa",
  "Photographie",
  "Traditions & Folklore",
]

const locations = ["Tous", "Tunis", "Sousse", "Djerba", "Sidi Bou Said", "Tabarka", "Hammamet", "Kairouan"]

const sortOptions = [
  { label: "Meilleures notes", value: "rating-desc" },
  { label: "Plus d'expérience", value: "experience-desc" },
  { label: "Temps de réponse", value: "response-asc" },
]

export default function AllGuides() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("Toutes")
  const [selectedLocation, setSelectedLocation] = useState("Tous")
  const [sortBy, setSortBy] = useState("rating-desc")
  const [visibleCount, setVisibleCount] = useState(6)

  // Fonction pour générer les étoiles de notation
  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars = []

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-yellow-400" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>,
      )
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-yellow-400" />)
    }

    return stars
  }

  // Filtrer les guides en fonction des critères
  const filteredGuides = guides.filter((guide) => {
    const matchesSearch =
      guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.specialty.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecialty = selectedSpecialty === "Toutes" || guide.specialty === selectedSpecialty
    const matchesLocation = selectedLocation === "Tous" || guide.location === selectedLocation

    return matchesSearch && matchesSpecialty && matchesLocation
  })

  // Trier les guides
  const sortedGuides = [...filteredGuides].sort((a, b) => {
    switch (sortBy) {
      case "rating-desc":
        return b.rating - a.rating
      case "experience-desc":
        // Extraire le nombre d'années d'expérience (ex: "5 ans" -> 5)
        const expA = Number.parseInt(a.experience.split(" ")[0])
        const expB = Number.parseInt(b.experience.split(" ")[0])
        return expB - expA
      case "response-asc":
        // Extraire le temps de réponse (ex: "2h" -> 2)
        const respA = Number.parseInt(a.responseTime.replace("h", ""))
        const respB = Number.parseInt(b.responseTime.replace("h", ""))
        return respA - respB
      default:
        return 0
    }
  })

  const visibleGuides = sortedGuides.slice(0, visibleCount)

  const loadMore = () => {
    setVisibleCount((prev) => prev + 6)
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedSpecialty("Toutes")
    setSelectedLocation("Tous")
    setSearchTerm("")
    setSortBy("rating-desc")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 tracking-tight"
          >
            Nos Guides Experts
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg max-w-2xl mx-auto text-slate-600"
          >
            Découvrez nos guides passionnés qui vous feront vivre une expérience authentique de la Tunisie
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 flex flex-col md:flex-row gap-4 sticky top-4 z-10 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-slate-200/50 shadow-sm"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher un guide..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 whitespace-nowrap">
                <Filter className="w-4 h-4" />
                Trier par
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={sortBy === option.value ? "bg-slate-100" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-slate-500" />
                  <span>Spécialité: {selectedSpecialty}</span>
                </div>
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {specialties.map((specialty) => (
                <DropdownMenuItem
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={selectedSpecialty === specialty ? "bg-slate-100 font-medium" : ""}
                >
                  {specialty}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span>Lieu: {selectedLocation}</span>
                </div>
                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {locations.map((location) => (
                <DropdownMenuItem
                  key={location}
                  onClick={() => setSelectedLocation(location)}
                  className={selectedLocation === location ? "bg-slate-100 font-medium" : ""}
                >
                  {location}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {filteredGuides.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">Aucun guide trouvé</h3>
            <p className="text-slate-500 max-w-md">
              Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
            </p>
            <Button variant="outline" onClick={resetFilters} className="mt-4">
              Réinitialiser les filtres
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleGuides.map((guide, index) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                  }}
                >
                  <Card className="overflow-hidden h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white rounded-xl">
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="relative bg-gradient-to-r from-blue-50 to-slate-50 p-6 flex flex-col items-center">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg mb-4">
                          <AvatarImage src={guide.image || "/placeholder.svg"} alt={guide.name} />
                          <AvatarFallback className="text-2xl bg-slate-200 text-slate-800">
                            {guide.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-none px-3 py-1 text-xs font-medium">
                          {guide.availability}
                        </Badge>

                        <h3 className="text-xl font-bold text-slate-900 mb-1">{guide.name}</h3>
                        <p className="text-blue-600 font-medium mb-2">{guide.specialty}</p>

                        <div className="flex items-center mb-2">
                          <div className="flex mr-2">{renderRatingStars(guide.rating)}</div>
                          <span className="text-slate-800 font-medium">
                            {guide.rating}
                            <span className="text-slate-500 ml-1 font-normal">({guide.reviews})</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <p className="text-slate-600 text-sm italic mb-4">"{guide.bio}"</p>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center text-slate-700 text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                            <span>{guide.location}</span>
                          </div>

                          <div className="flex items-center text-slate-700 text-sm">
                            <Award className="w-4 h-4 mr-2 text-slate-500" />
                            <span>{guide.experience}</span>
                          </div>

                          <div className="flex items-center text-slate-700 text-sm">
                            <MessageCircle className="w-4 h-4 mr-2 text-slate-500" />
                            <span>Répond en {guide.responseTime}</span>
                          </div>

                          <div className="flex items-center text-slate-700 text-sm">
                            <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                            <span>Réservation flexible</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center mb-2">
                            <Languages className="w-4 h-4 mr-2 text-slate-500" />
                            <span className="text-slate-700 font-medium text-sm">Langues parlées</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {guide.languages.map((language) => (
                              <Badge
                                key={language}
                                variant="outline"
                                className="bg-white border-slate-200 text-slate-700 text-xs px-2 py-0.5"
                              >
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-auto flex gap-2">
                          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                            Contacter
                            <Mail className="ml-2 h-4 w-4" />
                          </Button>
                          <Button variant="outline" className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50">
                            Voir le profil
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {visibleCount < filteredGuides.length && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-100 text-slate-800"
                >
                  Afficher plus de guides
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
