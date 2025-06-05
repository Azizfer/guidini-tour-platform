"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useState } from "react"

interface GuideLanguagesRegionsStepProps {
  languages: string[]
  setLanguages: (languages: string[]) => void
  coveredGovernorates: string[]
  setCoveredGovernorates: (governorates: string[]) => void
  onNext: () => void
  onPrev: () => void
}

const availableLanguages = [
  { id: "fr", label: "Français" },
  { id: "en", label: "Anglais" },
  { id: "ar", label: "Arabe" },
  { id: "de", label: "Allemand" },
  { id: "es", label: "Espagnol" },
  { id: "it", label: "Italien" },
]

// Group governorates by region for better organization
const tunisianGovernorates = [
  // North
  { id: "tunis", label: "Tunis", region: "Nord" },
  { id: "ariana", label: "Ariana", region: "Nord" },
  { id: "ben_arous", label: "Ben Arous", region: "Nord" },
  { id: "manouba", label: "Manouba", region: "Nord" },
  { id: "nabeul", label: "Nabeul", region: "Nord" },
  { id: "bizerte", label: "Bizerte", region: "Nord" },
  { id: "zaghouan", label: "Zaghouan", region: "Nord" },
  // Center
  { id: "sousse", label: "Sousse", region: "Centre" },
  { id: "monastir", label: "Monastir", region: "Centre" },
  { id: "mahdia", label: "Mahdia", region: "Centre" },
  { id: "kairouan", label: "Kairouan", region: "Centre" },
  { id: "sfax", label: "Sfax", region: "Centre" },
  // South
  { id: "gabes", label: "Gabès", region: "Sud" },
  { id: "medenine", label: "Médenine", region: "Sud" },
  { id: "tataouine", label: "Tataouine", region: "Sud" },
  { id: "tozeur", label: "Tozeur", region: "Sud" },
  { id: "kebili", label: "Kébili", region: "Sud" },
  { id: "gafsa", label: "Gafsa", region: "Sud" },
]

// Group governorates by region
const governoratesByRegion = tunisianGovernorates.reduce(
  (acc, governorate) => {
    if (!acc[governorate.region]) {
      acc[governorate.region] = []
    }
    acc[governorate.region].push(governorate)
    return acc
  },
  {} as Record<string, typeof tunisianGovernorates>,
)

export default function GuideLanguagesRegionsStep({
  languages,
  setLanguages,
  coveredGovernorates,
  setCoveredGovernorates,
  onNext,
  onPrev,
}: GuideLanguagesRegionsStepProps) {
  const [activeRegion, setActiveRegion] = useState<string>("Nord")

  const toggleLanguage = (id: string) => {
    if (languages.includes(id)) {
      setLanguages(languages.filter((l) => l !== id))
    } else {
      setLanguages([...languages, id])
    }
  }

  const toggleGovernorate = (id: string) => {
    if (coveredGovernorates.includes(id)) {
      setCoveredGovernorates(coveredGovernorates.filter((g) => g !== id))
    } else {
      setCoveredGovernorates([...coveredGovernorates, id])
    }
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Atmospheric effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5"></div>

      <div className="min-h-screen flex items-start justify-center px-4 pt-16 pb-8 relative z-10">
        <div className="w-full max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full"
          >
            {/* Header Section */}
            <div className="text-center mb-6">
              <p className="text-white text-2xl font-semibold mb-2 drop-shadow-lg">LANGUES ET RÉGIONS</p>
              <p className="text-blue-100 text-base drop-shadow-md">Indiquez vos langues et régions couvertes</p>
            </div>

            {/* Form Content */}
            <div className="space-y-5 backdrop-blur-sm">
              <div className="space-y-3">
                <h2 className="text-base font-medium text-white drop-shadow-md">Langues parlées</h2>
                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map((language) => {
                    const isSelected = languages.includes(language.id)
                    return (
                      <motion.button
                        key={language.id}
                        onClick={() => toggleLanguage(language.id)}
                        initial={false}
                        animate={{
                          backgroundColor: isSelected ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
                        }}
                        whileHover={{
                          backgroundColor: isSelected ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.15)",
                        }}
                        whileTap={{
                          backgroundColor: isSelected ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)",
                        }}
                        className={`
                          inline-flex items-center px-3 py-2 rounded-full text-sm font-medium
                          whitespace-nowrap overflow-hidden ring-1 ring-inset backdrop-blur-sm transition-all duration-300
                          ${isSelected ? "text-white ring-white/30" : "text-white/80 ring-white/20"}
                        `}
                      >
                        <div className="relative flex items-center">
                          <span>{language.label}</span>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-2"
                              >
                                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                  <Check className="w-3 h-3 text-blue-700" strokeWidth={3} />
                                </div>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-base font-medium text-white drop-shadow-md">Gouvernorats couverts</h2>

                {/* Region tabs */}
                <div className="flex gap-2 mb-3">
                  {Object.keys(governoratesByRegion).map((region) => (
                    <button
                      key={region}
                      onClick={() => setActiveRegion(region)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        activeRegion === region
                          ? "bg-white/30 text-white"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {governoratesByRegion[activeRegion].map((governorate) => {
                    const isSelected = coveredGovernorates.includes(governorate.id)
                    return (
                      <motion.button
                        key={governorate.id}
                        onClick={() => toggleGovernorate(governorate.id)}
                        initial={false}
                        animate={{
                          backgroundColor: isSelected ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
                        }}
                        whileHover={{
                          backgroundColor: isSelected ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.15)",
                        }}
                        whileTap={{
                          backgroundColor: isSelected ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)",
                        }}
                        className={`
                          inline-flex items-center px-3 py-2 rounded-full text-sm font-medium
                          whitespace-nowrap overflow-hidden ring-1 ring-inset backdrop-blur-sm transition-all duration-300
                          ${isSelected ? "text-white ring-white/30" : "text-white/80 ring-white/20"}
                        `}
                      >
                        <div className="relative flex items-center">
                          <span>{governorate.label}</span>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-2"
                              >
                                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                  <Check className="w-3 h-3 text-blue-700" strokeWidth={3} />
                                </div>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Selected count */}
                {coveredGovernorates.length > 0 && (
                  <p className="text-sm text-white/70 mt-2">
                    {coveredGovernorates.length} gouvernorat{coveredGovernorates.length > 1 ? "s" : ""} sélectionné
                    {coveredGovernorates.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="pt-3">
                <Button
                  onClick={handleNext}
                  className="w-full h-12 bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-blue-600 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-base"
                >
                  Continuer
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
