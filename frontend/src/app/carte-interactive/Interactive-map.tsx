"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, X, MapPin, Camera, Calendar } from "lucide-react"
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
  coordinates: [number, number]
  activities: number
  description: string
  attractions: string[]
  color: string
  image?: string
  rating: number
  bestTime: string
}

// Données des régions de Tunisie avec informations enrichies
const tunisiaRegions: Region[] = [
  {
    id: 1,
    name: "Tunis",
    coordinates: [36.8065, 10.1815],
    activities: 22,
    description: "La capitale dynamique, riche en histoire et culture, où se mélangent tradition et modernité.",
    attractions: ["Médina de Tunis", "Musée du Bardo", "Avenue Habib Bourguiba", "Sidi Bou Saïd"],
    color: "#0ea5e9",
    image: "/placeholder.svg?height=400&width=600&text=Tunis",
    rating: 4.8,
    bestTime: "Mars - Mai, Sept - Nov",
  },
  {
    id: 2,
    name: "Ariana",
    coordinates: [36.8625, 10.1933],
    activities: 15,
    description: "Région moderne du nord offrant un parfait équilibre entre urbanisme contemporain et espaces verts.",
    attractions: ["Parc Ennahli", "Lac de Tunis", "Centres commerciaux", "Jardins botaniques"],
    color: "#0ea5e9",
    image: "/placeholder.svg?height=400&width=600&text=Ariana",
    rating: 4.5,
    bestTime: "Toute l'année",
  },
  {
    id: 3,
    name: "Béja",
    coordinates: [36.73, 9.19],
    activities: 10,
    description: "Région agricole authentique avec un patrimoine historique exceptionnel et des paysages verdoyants.",
    attractions: ["Site archéologique de Dougga", "Forêts de chênes", "Thermes romains", "Villages traditionnels"],
    color: "#0ea5e9",
    image: "/placeholder.svg?height=400&width=600&text=Béja",
    rating: 4.3,
    bestTime: "Avril - Juin, Sept - Oct",
  },
  {
    id: 4,
    name: "Zaghouan",
    coordinates: [36.405, 10.1422],
    activities: 12,
    description: "Région montagneuse célèbre pour ses sources d'eau pure et ses vestiges romains remarquables.",
    attractions: ["Temple des Eaux", "Mont Zaghouan", "Aqueduc romain", "Sources naturelles"],
    color: "#0ea5e9",
    image: "/placeholder.svg?height=400&width=600&text=Zaghouan",
    rating: 4.4,
    bestTime: "Mars - Mai, Oct - Nov",
  },
  {
    id: 5,
    name: "Nabeul",
    coordinates: [36.4513, 10.7348],
    activities: 18,
    description: "Destination côtière prisée, réputée pour son artisanat traditionnel et ses magnifiques plages.",
    attractions: ["Plages de Hammamet", "Ateliers de poterie", "Marchés d'artisanat", "Marina de Yasmine"],
    color: "#0ea5e9",
    image: "/placeholder.svg?height=400&width=600&text=Nabeul",
    rating: 4.7,
    bestTime: "Mai - Sept",
  },
  {
    id: 6,
    name: "Sousse",
    coordinates: [35.83, 10.64],
    activities: 20,
    description: "Perle du Sahel, station balnéaire populaire avec une médina classée au patrimoine mondial.",
    attractions: ["Médina de Sousse", "Port El Kantaoui", "Plages dorées", "Ribat de Sousse"],
    color: "#0ea5e9",
    image: "/placeholder.svg?height=400&width=600&text=Sousse",
    rating: 4.6,
    bestTime: "Avril - Oct",
  },
  {
    id: 7,
    name: "Kairouan",
    coordinates: [35.67, 10.1],
    activities: 12,
    description: "Ville sainte de l'Islam, quatrième lieu saint après La Mecque, Médine et Jérusalem.",
    attractions: ["Grande Mosquée", "Médina de Kairouan", "Bassins des Aghlabides", "Mausolée de Sidi Saheb"],
    color: "#0ea5e9",
    image: "/placeholder.svg?height=400&width=600&text=Kairouan",
    rating: 4.5,
    bestTime: "Oct - Avril",
  },
  {
    id: 8,
    name: "Sfax",
    coordinates: [34.74, 10.76],
    activities: 15,
    description: "Centre économique du pays avec une médina authentique et un accès aux îles Kerkennah.",
    attractions: ["Médina de Sfax", "Îles Kerkennah", "Musée archéologique", "Vieille ville"],
    color: "#0ea5e9",
    image: "/placeholder.svg?height=400&width=600&text=Sfax",
    rating: 4.2,
    bestTime: "Mars - Mai, Sept - Nov",
  },
]

// Importer dynamiquement les composants React-Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })

// Composant pour centrer la carte
const SetViewOnClick = dynamic(
  () =>
    Promise.resolve(({ coords }: { coords: [number, number] }) => {
      const { useMap } = require("react-leaflet")
      const map = useMap()

      useEffect(() => {
        if (coords && map) {
          map.setView(coords, 9)
        }
      }, [coords, map])

      return null
    }),
  { ssr: false },
)

// Créer des marqueurs personnalisés
function createCustomMarker(color: string, isActive: boolean) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: ${color}; 
        width: ${isActive ? "20px" : "16px"}; 
        height: ${isActive ? "20px" : "16px"}; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: ${isActive ? "scale(1.2)" : "scale(1)"};
        transition: all 0.2s ease;
        cursor: pointer;
      "></div>
    `,
    iconSize: [isActive ? 20 : 16, isActive ? 20 : 16],
    iconAnchor: [isActive ? 10 : 8, isActive ? 10 : 8],
    popupAnchor: [0, -15],
  })
}

// Panneau latéral redesigné pour les détails de la région
const RegionSidePanel = ({ region, onClose }: { region: Region; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute right-0 top-0 h-[600px] w-[600px] bg-gradient-to-br from-white to-gray-50 shadow-xl z-20 overflow-y-auto border-l border-gray-100"
    >
      <div className="relative">
        {/* En-tête avec image et overlay moderne */}
        <div className="relative h-60 overflow-hidden">
          <Image
            src={region.image || "/placeholder.svg?height=400&width=600&text=Region"}
            alt={region.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Bouton de fermeture moderne */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-6 right-6 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full border-white/20 shadow-lg transition-all"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-white" />
          </Button>

          {/* Contenu de l'en-tête */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-blue-500/90 backdrop-blur-sm text-white font-medium px-4 py-2 rounded-full border-0">
                {region.activities} activités
              </Badge>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">{region.name}</h2>
            <p className="text-white/90 text-sm leading-relaxed drop-shadow-md">{region.description}</p>
          </div>
        </div>

        {/* Contenu principal avec design moderne */}
        <div className="p-4 space-y-4">
          {/* Meilleure période avec design card moderne */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500 rounded-lg shadow-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">Meilleure période</h4>
                <p className="text-blue-700 font-semibold text-xs">{region.bestTime}</p>
              </div>
            </div>
          </div>

          {/* Attractions principales avec design moderne */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2 text-sm flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Camera className="h-5 w-5 text-gray-600" />
              </div>
              Attractions principales
            </h3>
            <div className="space-y-4">
              {region.attractions.map((attraction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 text-xs">{attraction}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bouton d'action moderne */}
          <div className="pt-4">
            <Link href={`/region/${region.name.toLowerCase()}`} className="block">
              <Button className="w-full py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <span>Découvrir {region.name}</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function TunisiaInteractiveMap() {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null)
  const [isClient, setIsClient] = useState(false)
  const mapRef = useRef(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      delete (L.Icon.Default.prototype as any)._getIconUrl

      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      })
    }
  }, [])

  const handleRegionClick = (regionId: number) => {
    setSelectedRegion(regionId)
  }

  const activeRegion = selectedRegion ? tunisiaRegions.find((region) => region.id === selectedRegion) : null

  const mapStyle = {
    height: "100%",
    width: "100%",
    borderRadius: "0.5rem",
    overflow: "hidden",
  }

  if (!isClient) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse h-16 w-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-gray-500 font-medium">Chargement de la carte interactive...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Carte à gauche */}
        <div className="w-full md:w-3/5 h-[550px] bg-white rounded-lg shadow-md overflow-hidden">
          <MapContainer
            center={[34.8, 9.8] as [number, number]}
            zoom={6.5}
            style={mapStyle}
            minZoom={6}
            maxZoom={12}
            maxBounds={[[30.2, 7.5] as [number, number], [37.6, 11.6] as [number, number]]}
            ref={mapRef}
            className="z-0"
            worldCopyJump={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {activeRegion && <SetViewOnClick coords={activeRegion.coordinates} />}
            {tunisiaRegions.map((region) => (
              <Marker
                key={region.id}
                position={region.coordinates}
                icon={createCustomMarker(region.color, selectedRegion === region.id)}
                eventHandlers={{
                  click: () => handleRegionClick(region.id),
                  mouseover: () => setHoveredRegion(region.id),
                  mouseout: () => setHoveredRegion(null),
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Panneau d'informations à droite */}
        <div className="w-full md:w-2/5 h-[550px] bg-white rounded-lg shadow-md overflow-y-auto">
          {activeRegion ? (
            <div className="h-full">
              {/* En-tête avec image */}
              <div className="relative h-40 bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="relative p-4 h-full flex flex-col justify-end">
                  <div className="mb-2">
                    <span className="bg-blue-500 text-xs font-medium px-2 py-1 rounded-full">
                      {activeRegion.activities} activités
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{activeRegion.name}</h2>
                  <p className="text-xs text-white/90 line-clamp-2">{activeRegion.description}</p>
                </div>
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 rounded-full p-1"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Meilleure période */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500">Meilleure période</h4>
                    <p className="text-sm font-medium">{activeRegion.bestTime}</p>
                  </div>
                </div>
              </div>

              {/* Attractions */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Camera className="h-4 w-4 text-gray-500" />
                  Attractions principales
                </h3>
                
                <div className="space-y-2">
                  {activeRegion.attractions.map((attraction, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-xs">{attraction}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton d'action */}
              <div className="p-4 pt-2">
                <Link href={`/region/${activeRegion.name.toLowerCase()}`} className="block">
                  <Button className="w-full py-2 text-xs font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white">
                    Découvrir {activeRegion.name}
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-center">
              <div>
                <div className="bg-blue-50 p-3 rounded-full inline-flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Explorez la Tunisie</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Cliquez sur les points colorés pour explorer chaque région et découvrir ses attractions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions d'utilisation */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm text-xs">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-gray-600">Cliquez sur les points colorés pour explorer chaque région</span>
        </div>
      </div>
    </div>
  )
}
