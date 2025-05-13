"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import HandWrittenTitle from "@/components/ui/hand-written-title"

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

const transitionProps = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
}

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
    <div className="flex flex-col">
      <HandWrittenTitle
        title="Détails du voyage"
        subtitle="Aidez-nous à trouver les meilleurs guides pour vous"
        size="sm"
        className="mb-6"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6 w-full"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-800">Avec qui voyagez-vous?</h2>
          <motion.div className="flex flex-wrap gap-2" layout transition={transitionProps}>
            {companionOptions.map((option) => {
              const isSelected = travelCompanions.includes(option.id)
              return (
                <motion.button
                  key={option.id}
                  onClick={() => toggleCompanion(option.id)}
                  layout
                  initial={false}
                  animate={{
                    backgroundColor: isSelected ? "#e6f7f5" : "rgba(255, 255, 255, 0.5)",
                  }}
                  whileHover={{
                    backgroundColor: isSelected ? "#e6f7f5" : "rgba(240, 240, 240, 0.8)",
                  }}
                  whileTap={{
                    backgroundColor: isSelected ? "#d1f0ed" : "rgba(230, 230, 230, 0.9)",
                  }}
                  transition={{
                    ...transitionProps,
                    backgroundColor: { duration: 0.1 },
                  }}
                  className={`
                    inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                    whitespace-nowrap overflow-hidden ring-1 ring-inset
                    ${isSelected ? "text-teal-700 ring-teal-200" : "text-gray-600 ring-gray-200"}
                  `}
                >
                  <motion.div
                    className="relative flex items-center"
                    animate={{
                      width: isSelected ? "auto" : "100%",
                      paddingRight: isSelected ? "1.5rem" : "0",
                    }}
                    transition={{
                      ease: [0.175, 0.885, 0.32, 1.275],
                      duration: 0.3,
                    }}
                  >
                    <span>{option.label}</span>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={transitionProps}
                          className="absolute right-0"
                        >
                          <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.button>
              )
            })}
          </motion.div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-800">Quel est votre budget?</h2>
          <motion.div className="flex flex-wrap gap-2" layout transition={transitionProps}>
            {budgetOptions.map((option) => {
              const isSelected = budget.includes(option.value)
              return (
                <motion.button
                  key={option.value}
                  onClick={() => toggleBudget(option.value)}
                  layout
                  initial={false}
                  animate={{
                    backgroundColor: isSelected ? "#e6f7f5" : "rgba(255, 255, 255, 0.5)",
                  }}
                  whileHover={{
                    backgroundColor: isSelected ? "#e6f7f5" : "rgba(240, 240, 240, 0.8)",
                  }}
                  whileTap={{
                    backgroundColor: isSelected ? "#d1f0ed" : "rgba(230, 230, 230, 0.9)",
                  }}
                  transition={{
                    ...transitionProps,
                    backgroundColor: { duration: 0.1 },
                  }}
                  className={`
                    inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                    whitespace-nowrap overflow-hidden ring-1 ring-inset
                    ${isSelected ? "text-teal-700 ring-teal-200" : "text-gray-600 ring-gray-200"}
                  `}
                >
                  <motion.div
                    className="relative flex items-center"
                    animate={{
                      width: isSelected ? "auto" : "100%",
                      paddingRight: isSelected ? "1.5rem" : "0",
                    }}
                    transition={{
                      ease: [0.175, 0.885, 0.32, 1.275],
                      duration: 0.3,
                    }}
                  >
                    <span>{option.label}</span>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={transitionProps}
                          className="absolute right-0"
                        >
                          <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.button>
              )
            })}
          </motion.div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleNext}
            className="w-full py-6 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium"
          >
            Continuer
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
