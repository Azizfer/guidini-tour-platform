"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Award, ChevronLeft, ChevronRight, Languages, MapPin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import SectionDivider from "@/components/section-divider"
import Link from "next/link"
import guideService, { Guide } from "@/services/guideService"
import { useChat } from "@/contexts/chat-context"

// Interface pour les guides transformés pour l'affichage
interface DisplayGuide {
  id: string;
  name: string;
  specialty: string;
  image: string;
  languages: string[];
  experience: string;
  bio: string;
  location: string;
  availability: string;
}

// Fonction pour transformer les guides de l'API en format d'affichage
const transformGuideData = (guide: Guide): DisplayGuide => {
  // Déterminer la spécialité principale du guide
  const specialty = guide.expertise && guide.expertise.length > 0 
    ? guide.expertise[0] === "history" ? "Histoire & Culture" 
    : guide.expertise[0] === "culture" ? "Culture & Traditions"
    : guide.expertise[0] === "nature" ? "Nature & Randonnée"
    : guide.expertise[0] === "gastronomy" ? "Gastronomie"
    : guide.expertise[0] === "adventure" ? "Sports & Aventure"
    : guide.expertise[0] === "art" ? "Art & Architecture"
    : "Guide Touristique"
    : "Guide Touristique";

  // Déterminer la localisation principale du guide
  const location = guide.coveredGovernorates && guide.coveredGovernorates.length > 0
    ? guide.coveredGovernorates[0]
    : "Tunisie";

  return {
    id: guide._id,
    name: guide.name,
    specialty,
    image: guide.profileImage || `/placeholder.svg?height=400&width=400&text=${guide.name}`,
    languages: guide.languages || ["Français"],
    experience: `${guide.yearsOfExperience || 1} ans`,
    bio: guide.description || "Guide touristique passionné par la Tunisie et sa culture.",
    location,
    availability: "Disponible",
  };
};

export default function PopularGuides() {
  const [guides, setGuides] = useState<DisplayGuide[]>([])
  const [currentGuide, setCurrentGuide] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [loading, setLoading] = useState(true)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  
  // Get the chat context
  const { openChat, refreshConversations } = useChat()

  // Scroll animation references
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [100, 0, 0, 100])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0.8, 1, 1, 0.8])

  const nextGuide = () => {
    setDirection(1)
    setCurrentGuide((prev) => (prev + 1) % guides.length)
  }

  const prevGuide = () => {
    setDirection(-1)
    setCurrentGuide((prev) => (prev - 1 + guides.length) % guides.length)
  }

  // Récupérer les guides depuis l'API
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setLoading(true);
        console.log('Fetching guides from API...');
        const apiGuides = await guideService.getAllGuides();
        console.log('Guides fetched:', apiGuides);
        
        if (apiGuides && apiGuides.length > 0) {
          // Transformer les données des guides pour l'affichage
          const displayGuides = apiGuides.map(transformGuideData);
          console.log('Transformed guides:', displayGuides);
          setGuides(displayGuides);
        } else {
          console.warn('No guides returned from API');
          // Utiliser des guides par défaut en cas d'absence de données
          setGuides([
            {
              id: "1",
              name: "Guide par défaut",
              specialty: "Guide Touristique",
              image: "/placeholder.svg?height=400&width=400&text=Guide",
              languages: ["Français"],
              experience: "1 an",
              bio: "Guide touristique passionné par la Tunisie et sa culture.",
              location: "Tunisie",
              availability: "Disponible",
            }
          ]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des guides:", error);
        // Utiliser des guides par défaut en cas d'erreur
        setGuides([
          {
            id: "1",
            name: "Guide par défaut",
            specialty: "Guide Touristique",
            image: "/placeholder.svg?height=400&width=400&text=Guide",
            languages: ["Français"],
            experience: "1 an",
            bio: "Guide touristique passionné par la Tunisie et sa culture.",
            location: "Tunisie",
            availability: "Disponible",
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  // Rotation automatique des guides (pause on hover)
  useEffect(() => {
    if (isHovering || !isAutoPlaying || guides.length === 0) return

    autoPlayRef.current = setInterval(() => {
      nextGuide()
    }, 5000)

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isHovering, isAutoPlaying, guides.length])

  // Arrêter l'autoplay quand l'utilisateur interagit
  const handleUserInteraction = () => {
    setIsAutoPlaying(false)
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
  }

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
      }
    },
  }

  // Afficher un message de chargement si les guides sont en cours de chargement
  if (loading || guides.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3 text-slate-900 tracking-tight">Chargement des guides...</h2>
        </div>
      </section>
    )
  }

  return (
    <>
      <SectionDivider variant="curve" color="#f8fafc" />

      <motion.section ref={sectionRef} className="py-20 bg-gradient-to-b from-slate-50 to-white" style={{ opacity, y }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 fade-in"
          >
            <Badge className="mb-3 px-3 py-1 text-sm font-medium bg-slate-100 text-slate-800 rounded-full">
              Guides Certifiés
            </Badge>
            <h2 className="text-3xl font-bold mb-3 text-slate-900 tracking-tight">Voyagez avec des Experts Locaux</h2>
            <p className="text-slate-600 max-w-3xl mx-auto text-base">
              Découvrez nos guides passionnés qui vous feront vivre une expérience authentique de la Tunisie
            </p>
          </motion.div>

          <motion.div style={{ scale }} transition={{ duration: 0.5 }} className="relative max-w-5xl mx-auto">
            {/* Left navigation button */}
            <div className="absolute top-1/2 -left-16 transform -translate-y-1/2 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/70 hover:bg-white/90 text-slate-700 shadow-md h-10 w-10 md:h-12 md:w-12"
                onClick={() => {
                  prevGuide()
                  handleUserInteraction()
                }}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Précédent</span>
              </Button>
            </div>

            {/* Right navigation button */}
            <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/70 hover:bg-white/90 text-slate-700 shadow-md h-10 w-10 md:h-12 md:w-12"
                onClick={() => {
                  nextGuide()
                  handleUserInteraction()
                }}
              >
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Suivant</span>
              </Button>
            </div>
            
            <Card
              className="relative overflow-hidden shadow-xl rounded-2xl border-none"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <CardContent className="p-0">

                {/* Carousel de guides */}
                <div className="relative h-[450px] md:h-[450px] overflow-hidden bg-gradient-to-r from-slate-50 to-white">
                  <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                      key={currentGuide}
                      custom={direction}
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                      }}
                      className="absolute w-full h-full"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full p-8 md:p-10">
                        <div className="flex flex-col justify-center items-center md:items-end">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                          >
                            <div className="relative">
                              <Avatar className="h-56 w-56 border-4 border-white shadow-lg">
                                <AvatarImage
                                  src={guides[currentGuide].image || "/placeholder.svg"}
                                  alt={guides[currentGuide].name}
                                />
                                <AvatarFallback className="text-4xl bg-slate-200 text-slate-800">
                                  {guides[currentGuide].name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>

                              {/* Status badge */}
                              <Badge className="absolute bottom-4 right-4 bg-emerald-500 text-white border-none px-4 py-1.5 text-sm font-medium">
                                {guides[currentGuide].availability}
                              </Badge>
                            </div>

                            <div className="mt-4 flex justify-center">
                              <div className="flex items-center">
                                <Badge className="bg-blue-100 text-blue-800 border-none px-3 py-1 text-sm font-medium">
                                  {guides[currentGuide].specialty}
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        <div className="flex flex-col justify-center">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="space-y-6 stagger-fade-in"
                          >
                            <div>
                              <h3 className="text-3xl font-bold text-slate-900 mb-2">{guides[currentGuide].name}</h3>
                              <p className="text-xl text-slate-700 mb-3">{guides[currentGuide].specialty}</p>
                            </div>

                            <p className="text-slate-600 italic text-sm">"{guides[currentGuide].bio}"</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center text-slate-700">
                                <MapPin className="w-5 h-5 mr-2 text-slate-500" />
                                <span className="text-base">{guides[currentGuide].location}</span>
                              </div>

                              <div className="flex items-center text-slate-700">
                                <Award className="w-5 h-5 mr-2 text-slate-500" />
                                <span className="text-base">{guides[currentGuide].experience}</span>
                              </div>

                              {/* Les éléments "Répond en 2h" et "Réservation flexible" ont été supprimés car ces informations ne sont pas disponibles dans la base de données */}
                            </div>

                            <div>
                              <div className="flex items-center mb-3">
                                <Languages className="w-5 h-5 mr-2 text-slate-500" />
                                <span className="text-slate-700 font-medium text-base">Langues parlées</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {guides[currentGuide].languages.map((language) => (
                                  <Badge
                                    key={language}
                                    variant="outline"
                                    className="bg-white border-slate-200 text-slate-700 text-sm px-3 py-1"
                                  >
                                    {language}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-base font-medium flex items-center"
                                onClick={() => {
                                  // Fonction pour démarrer une conversation avec un guide
                                  const handleContactGuide = (guide: DisplayGuide) => {
                                    try {
                                      // Refresh conversations first to ensure we have the latest data
                                      refreshConversations().then(() => {
                                        // Ouvrir le chat avec le guide sélectionné
                                        openChat({
                                          id: guide.id,
                                          name: guide.name,
                                          avatar: guide.image,
                                          online: true
                                        });
                                      }).catch(error => {
                                        console.error('Error refreshing conversations:', error);
                                        // Still try to open chat even if refresh fails
                                        openChat({
                                          id: guide.id,
                                          name: guide.name,
                                          avatar: guide.image,
                                          online: true
                                        });
                                      });
                                    } catch (error) {
                                      console.error('Error contacting guide:', error);
                                      // Fallback - open chat directly
                                      openChat({
                                        id: guide.id,
                                        name: guide.name,
                                        avatar: guide.image,
                                        online: true
                                      });
                                    }
                                  }
                                  handleContactGuide(guides[currentGuide]);
                                }}
                              >
                                Contacter
                                <Mail className="ml-2 h-5 w-5" />
                              </Button>

                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-base font-medium flex items-center"
                                onClick={() => {
                                  window.location.href = `/guides/${guides[currentGuide].id}`;
                                }}
                              >
                                Voir le profil
                                <ChevronRight className="ml-2 h-5 w-5" />
                              </Button>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-12 fade-in"
          >
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-2 font-medium text-base shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center"
              onClick={() => {
                window.location.href = '/guides';
              }}
            >
              Voir tous les guides
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </>
  )
}
