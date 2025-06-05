"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface TouristTravelDetailsStepProps {
  travelCompanions: string[]
  setTravelCompanions: (companions: string[]) => void
  budget: string[]
  setBudget: (budget: string[]) => void
  onNext: () => void
  onPrev: () => void
}

const companionOptions = [
  { id: "solo", label: "Seul(e)" },
  { id: "couple", label: "En couple" },
  { id: "family", label: "En famille" },
  { id: "friends", label: "Entre amis" },
  { id: "group", label: "En groupe" },
]

const budgetOptions = [
  { value: "economy", label: "Économique" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxe" },
]

export default function TouristTravelDetailsStep({
  travelCompanions,
  setTravelCompanions,
  budget,
  setBudget,
  onNext,
  onPrev,
}: TouristTravelDetailsStepProps) {
  const toggleCompanion = (id: string) => {
    if (travelCompanions.includes(id)) {
      setTravelCompanions(travelCompanions.filter((c) => c !== id))
    } else {
      setTravelCompanions([...travelCompanions, id])
    }
  }

  const toggleBudget = (value: string) => {
    if (budget.includes(value)) {
      setBudget(budget.filter((b) => b !== value))
    } else {
      setBudget([...budget, value])
    }
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Atmospheric effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5"></div>

      <div className="min-h-screen flex items-start justify-center px-4 pt-20 pb-8 relative z-10">
        <div className="w-full max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full"
          >
            {/* Header Section */}
            <div className="text-center mb-6">
              <p className="text-white text-2xl font-semibold mb-2 drop-shadow-lg">DÉTAILS DU VOYAGE</p>
              <p className="text-blue-100 text-base drop-shadow-md">Aidez-nous à trouver les meilleurs guides</p>
            </div>

            {/* Form Content */}
            <div className="space-y-5 backdrop-blur-sm">
              <div className="space-y-3">
                <h2 className="text-base font-medium text-white drop-shadow-md">Avec qui voyagez-vous?</h2>
                <div className="flex flex-wrap gap-2">
                  {companionOptions.map((option) => {
                    const isSelected = travelCompanions.includes(option.id)
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => toggleCompanion(option.id)}
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
                          <span>{option.label}</span>
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
                <h2 className="text-base font-medium text-white drop-shadow-md">Quel est votre budget?</h2>
                <div className="flex flex-wrap gap-2">
                  {budgetOptions.map((option) => {
                    const isSelected = budget.includes(option.value)
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => toggleBudget(option.value)}
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
                          <span>{option.label}</span>
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

              <div className="pt-4">
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
