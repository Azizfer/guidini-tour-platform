"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, X, Info, ChevronRight, ChevronLeft, Sparkles, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Définir le type pour les régions
interface Region {
  id: number
  name: string
  coordinates: [number, number] // [latitude, longitude]
  activities: number
  description: string
  attractions: string[]
  color: string
  image?: string
}

// Données des régions de Tunisie avec positions ajustées selon la carte de référence
const tunisiaRegions: Region[] = [
  {
    id: 1,
    name: "Tunis",
    coordinates: [36.8065, 10.1815], // Latitude, Longitude (inversé pour Leaflet)
    activities: 22,
    description: "La capitale, riche en histoire et culture",
    attractions: ["Médina de Tunis", "Musée du Bardo", "Avenue Habib Bourguiba"],
    color: "#14b8a6", // Couleur teal-500
    image: "/placeholder.svg?height=300&width=400&text=Tunis",
  },
  {
    id: 2,
    name: "Ariana",
    coordinates: [36.8625, 10.1933],
    activities: 15,
    description: "Région du nord avec un mélange d'urbanisme et de nature",
    attractions: ["Parc Ennahli", "Lac de Tunis", "Centres commerciaux"],
    color: "#0ea5e9", // Couleur sky-500
    image: "/placeholder.svg?height=300&width=400&text=Ariana",
  },
  {
    id: 3,
    name: "Béja",
    coordinates: [36.73, 9.19],
    activities: 10,
    description: "Région agricole avec un riche patrimoine historique",
    attractions: ["Site archéologique de Dougga", "Forêts de chênes", "Thermes romains"],
    color: "#8b5cf6", // Couleur violet-500
    image: "/placeholder.svg?height=300&width=400&text=Béja",
  },
  {
    id: 4,
    name: "Zaghouan",
    coordinates: [36.405, 10.1422],
    activities: 12,
    description: "Connue pour ses montagnes et sources d'eau",
    attractions: ["Temple des Eaux", "Mont Zaghouan", "Aqueduc romain"],
    color: "#f59e0b", // Couleur amber-500
    image: "/placeholder.svg?height=300&width=400&text=Zaghouan",
  },
  {
    id: 5,
    name: "Nabeul",
    coordinates: [36.4513, 10.7348],
    activities: 18,
    description: "Région côtière réputée pour son artisanat",
    attractions: ["Plages de Hammamet", "Ateliers de poterie", "Marchés d'artisanat"],
    color: "#10b981", // Couleur emerald-500
    image: "/placeholder.svg?height=300&width=400&text=Nabeul",
  },
  {
    id: 6,
    name: "Siliana",
    coordinates: [36.0839, 9.37],
    activities: 8,
    description: "Région montagneuse avec des paysages spectaculaires",
    attractions: ["Montagnes de Siliana", "Sites archéologiques", "Agriculture traditionnelle"],
    color: "#3b82f6", // Couleur blue-500
    image: "/placeholder.svg?height=300&width=400&text=Siliana",
  },
  {
    id: 7,
    name: "Kassrine",
    coordinates: [35.17, 8.83],
    activities: 14,
    description: "Région frontalière avec un riche patrimoine naturel",
    attractions: ["Parc national de Chaambi", "Sites romains", "Cascades"],
    color: "#ef4444", // Couleur red-500
    image: "/placeholder.svg?height=300&width=400&text=Kassrine",
  },
  {
    id: 8,
    name: "Mahdia",
    coordinates: [35.5047, 11.0622],
    activities: 16,
    description: "Ville côtière historique avec des plages magnifiques",
    attractions: ["Médina de Mahdia", "Cap Africa", "Plages de sable fin"],
    color: "#ec4899", // Couleur pink-500
    image: "/placeholder.svg?height=300&width=400&text=Mahdia",
  },
  {
    id: 9,
    name: "Sousse",
    coordinates: [35.83, 10.64],
    activities: 20,
    description: "Station balnéaire populaire avec une médina historique",
    attractions: ["Médina de Sousse", "Port El Kantaoui", "Plages de Sousse"],
    color: "#06b6d4", // Couleur cyan-500
    image: "/placeholder.svg?height=300&width=400&text=Sousse",
  },
  {
    id: 10,
    name: "Kairouan",
    coordinates: [35.67, 10.1],
    activities: 12,
    description: "Ville sainte avec une grande mosquée historique",
    attractions: ["Grande Mosquée", "Médina de Kairouan", "Bassins des Aghlabides"],
    color: "#8b5cf6", // Couleur violet-500
    image: "/placeholder.svg?height=300&width=400&text=Kairouan",
  },
  {
    id: 11,
    name: "Sidi Bouzid",
    coordinates: [35.04, 9.49],
    activities: 7,
    description: "Région centrale connue pour son agriculture",
    attractions: ["Place de la Révolution", "Marchés locaux", "Paysages ruraux"],
    color: "#f97316", // Couleur orange-500
    image: "/placeholder.svg?height=300&width=400&text=Sidi+Bouzid",
  },
  {
    id: 12,
    name: "Sfax",
    coordinates: [34.74, 10.76],
    activities: 15,
    description: "Centre économique avec une médina authentique",
    attractions: ["Médina de Sfax", "Îles Kerkennah", "Musée archéologique"],
    color: "#0891b2", // Couleur cyan-700
    image: "/placeholder.svg?height=300&width=400&text=Sfax",
  },
  {
    id: 13,
    name: "Kébili",
    coordinates: [33.71, 8.97],
    activities: 9,
    description: "Porte du désert avec des oasis magnifiques",
    attractions: ["Oasis de Kébili", "Dunes de sable", "Villages traditionnels"],
    color: "#d97706", // Couleur amber-600
    image: "/placeholder.svg?height=300&width=400&text=Kébili",
  },
  {
    id: 14,
    name: "Tataouine",
    coordinates: [32.9297, 10.4518],
    activities: 11,
    description: "Région désertique avec des paysages lunaires",
    attractions: ["Ksour de Tataouine", "Sites de Star Wars", "Villages berbères"],
    color: "#b45309", // Couleur amber-700
    image: "/placeholder.svg?height=300&width=400&text=Tataouine",
  },
]

// Importer dynamiquement les composants React-Leaflet pour éviter les erreurs SSR
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

// Composant pour centrer la carte sur une région sélectionnée
const SetViewOnClick = dynamic(
  () =>
    Promise.resolve(({ coords }: { coords: [number, number] }) => {
      // Utiliser require au lieu de dynamic import pour le hook
      const { useMap } = require("react-leaflet");
      const map = useMap();
      
      useEffect(() => {
        if (coords && map) {
          map.setView(coords, 8);
        }
      }, [coords, map]);

      return null;
    }),
  { ssr: false }
)

// Composant pour créer des marqueurs simplifiés
function createSimpleMarker(color: string, isActive: boolean) {
  return L.divIcon({
    className: "simple-marker",
    html: `<div style="
      background-color: ${color}; 
      width: ${isActive ? "14px" : "12px"}; 
      height: ${isActive ? "14px" : "12px"}; 
      border-radius: 50%; 
      border: 2px solid white; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [isActive ? 14 : 12, isActive ? 14 : 12],
    iconAnchor: [isActive ? 7 : 6, isActive ? 7 : 6],
    popupAnchor: [0, -10],
  })
}

// Composant pour le popover détaillé amélioré
const RegionDetailPopover = ({ region, onClose }: { region: Region; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56">
          <Image
            src={region.image || "/placeholder.svg?height=300&width=400&text=Region"}
            alt={region.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
            <div className="p-6 text-white">
              <h2 className="text-3xl font-bold mb-2">{region.name}</h2>
              <Badge
                style={{ backgroundColor: region.color }}
                className="px-3 py-1 text-white font-medium rounded-full"
              >
                {region.activities} activités
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full border-0 shadow-md"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-lg">
              <Info className="h-5 w-5 mr-2 text-gray-500" />
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">{region.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Attractions principales</h3>
            <ul className="space-y-2">
              {region.attractions.map((attraction, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-medium"
                    style={{ backgroundColor: region.color }}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-700">{attraction}</span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href={`/region/${region.name.toLowerCase()}`}
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 shadow-md"
            style={{
              background: `linear-gradient(to right, ${region.color}, ${adjustColor(region.color, 30)})`,
            }}
          >
            <span>Découvrir {region.name}</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Fonction pour ajuster la couleur (éclaircir ou assombrir)
function adjustColor(color: string, amount: number): string {
  // Convertir la couleur hex en RGB
  let r = Number.parseInt(color.substring(1, 3), 16)
  let g = Number.parseInt(color.substring(3, 5), 16)
  let b = Number.parseInt(color.substring(5, 7), 16)

  // Ajuster les valeurs RGB
  r = Math.min(255, Math.max(0, r + amount))
  g = Math.min(255, Math.max(0, g + amount))
  b = Math.min(255, Math.max(0, b + amount))

  // Convertir en hex
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

export default function TunisiaInteractiveMap() {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showDetailPopover, setShowDetailPopover] = useState(false)
  const mapRef = useRef(null)

  // Vérifier si nous sommes côté client pour éviter les erreurs SSR
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Correction pour les icônes Leaflet qui ne s'affichent pas correctement en Next.js
  useEffect(() => {
    // Seulement côté client
    if (typeof window !== "undefined") {
      // Utiliser une assertion de type pour contourner la vérification TypeScript
      // @ts-ignore - _getIconUrl existe dans l'implémentation mais pas dans les types
      delete (L.Icon.Default.prototype as any)._getIconUrl

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })
    }
  }, [])

  const handleRegionClick = (regionId: number) => {
    setSelectedRegion(regionId)
    setShowDetailPopover(true)
  }

  // Trouver la région sélectionnée
  const activeRegion = selectedRegion ? tunisiaRegions.find((region) => region.id === selectedRegion) : null

  // Styles CSS pour la carte
  const mapStyle = {
    height: "100%",
    width: "100%",
    borderRadius: "1rem",
    overflow: "hidden",
  }

  // Fonction pour naviguer dans le carrousel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === tunisiaRegions.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? tunisiaRegions.length - 1 : prev - 1))
  }

  // Fonction pour obtenir une URL de tuile de carte stylisée
  const getStylizedMapTileUrl = () => {
    // Utiliser une carte stylisée avec des couleurs vives
    return "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  }

  if (!isClient) {
    // Afficher un placeholder pendant le chargement côté client
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse h-16 w-16 bg-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-teal-500" />
            </div>
            <p className="text-gray-500 font-medium">Chargement de la carte interactive...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden h-[600px]">
        <MapContainer
          center={[34.3174, 9.5375] as [number, number]}
          zoom={6}
          style={mapStyle}
          minZoom={6} // Augmenter le zoom minimum pour éviter de voir les zones grises
          maxZoom={10}
          maxBounds={[[30.2, 7.5] as [number, number], [37.6, 11.6] as [number, number]]}
          ref={mapRef}
          className="z-0"
          worldCopyJump={true} // Évite les problèmes de répétition de la carte
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={getStylizedMapTileUrl()}
          />

          {activeRegion && <SetViewOnClick coords={activeRegion.coordinates} />}

          {tunisiaRegions.map((region) => (
            <Marker
              key={region.id}
              position={region.coordinates}
              icon={createSimpleMarker(region.color, selectedRegion === region.id)}
              eventHandlers={{
                click: () => handleRegionClick(region.id),
                mouseover: () => setHoveredRegion(region.id),
                mouseout: () => setHoveredRegion(null),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="font-bold text-lg mb-1">{region.name}</div>
                  <div className="text-sm mb-2">{region.description}</div>
                  <div className="flex justify-between items-center">
                    <Badge
                      style={{ backgroundColor: region.color }}
                      className="text-white font-medium px-3 py-1 rounded-full"
                    >
                      {region.activities} activités
                    </Badge>
                    <Button
                      size="sm"
                      className="rounded-lg"
                      style={{ backgroundColor: region.color }}
                      onClick={() => handleRegionClick(region.id)}
                    >
                      Détails
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Carrousel des régions en bas */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6 overflow-hidden">
        <h3 className="font-semibold mb-4 text-gray-800 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-teal-500" />
          Découvrez toutes les régions
        </h3>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {tunisiaRegions.map((region, index) => (
                <div key={region.id} className="w-full flex-shrink-0">
                  <div
                    className="relative h-48 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => handleRegionClick(region.id)}
                  >
                    <Image
                      src={region.image || "/placeholder.svg?height=300&width=400&text=Region"}
                      alt={region.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <div className="p-4 text-white">
                        <Badge
                          style={{ backgroundColor: region.color }}
                          className="mb-2 px-3 py-1 text-white font-medium rounded-full"
                        >
                          {region.activities} activités
                        </Badge>
                        <h3 className="text-xl font-bold">{region.name}</h3>
                        <p className="text-sm text-white/90 mt-1">{region.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-md z-10"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-md z-10"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="flex justify-center mt-4 gap-1">
            {tunisiaRegions.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentSlide === index ? "bg-teal-500" : "bg-gray-300"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Popover de détails */}
      <AnimatePresence>
        {showDetailPopover && activeRegion && (
          <RegionDetailPopover
            region={activeRegion}
            onClose={() => {
              setShowDetailPopover(false)
              setSelectedRegion(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
