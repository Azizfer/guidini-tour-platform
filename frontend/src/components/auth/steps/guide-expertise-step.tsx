"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import HandWrittenTitle from "@/components/ui/hand-written-title"

interface GuideExpertiseStepProps {
  expertise: string[]
  setExpertise: (expertise: string[]) => void
  yearsOfExperience: number
  setYearsOfExperience: (years: number) => void
  description: string
  setDescription: (description: string) => void
  onNext: () => void
  onPrev: () => void
}

const expertiseOptions = [
  { id: "history", label: "Histoire et Patrimoine" },
  { id: "culture", label: "Culture et Traditions" },
  { id: "nature", label: "Nature et Randonnée" },
  { id: "gastronomy", label: "Gastronomie" },
  { id: "adventure", label: "Sports et Aventure" },
  { id: "art", label: "Art et Architecture" },
]

const transitionProps = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
}

export default function GuideExpertiseStep({
  expertise,
  setExpertise,
  yearsOfExperience,
  setYearsOfExperience,
  description,
  setDescription,
  onNext,
  onPrev,
}: GuideExpertiseStepProps) {
  const toggleExpertise = (id: string) => {
    if (expertise.includes(id)) {
      setExpertise(expertise.filter((e) => e !== id))
    } else {
      setExpertise([...expertise, id])
    }
  }

  const handleNext = () => {
    onNext()
  }

  return (
    <div className="flex flex-col">
      <HandWrittenTitle
        title="Votre expertise"
        subtitle="Parlez-nous de vos domaines de spécialité"
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
          <h2 className="text-lg font-medium text-gray-800">Domaines d'expertise</h2>
          <motion.div className="flex flex-wrap gap-2" layout transition={transitionProps}>
            {expertiseOptions.map((option) => {
              const isSelected = expertise.includes(option.id)
              return (
                <motion.button
                  key={option.id}
                  onClick={() => toggleExpertise(option.id)}
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
          <h2 className="text-lg font-medium text-gray-800">Années d'expérience</h2>
          <div className="flex items-center">
            <input
              type="number"
              min="0"
              max="50"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <span className="ml-2 text-gray-600">ans</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-800">Description</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Présentez-vous brièvement et décrivez votre expérience en tant que guide..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-32"
          />
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
