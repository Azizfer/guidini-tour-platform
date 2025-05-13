"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { UserType } from "@/components/sign-up-process"
import { UserIcon, MapIcon } from "lucide-react"
import HandWrittenTitle from "@/components/ui/hand-written-title"

interface UserTypeStepProps {
  name: string
  userType: UserType
  setUserType: (type: UserType) => void
  onNext: () => void
  onPrev: () => void
}

export default function UserTypeStep({ name, userType, setUserType, onNext, onPrev }: UserTypeStepProps) {
  const handleNext = () => {
    if (!userType) {
      return
    }
    onNext()
  }

  return (
    <div className="flex flex-col items-center">
      <HandWrittenTitle
        title={`Bonjour, ${name}!`}
        subtitle="Quel type d'utilisateur êtes-vous?"
        size="sm"
        className="mb-6"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6 w-full"
      >
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setUserType("touriste")}
            className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center ${
              userType === "touriste"
                ? "border-teal-500 bg-teal-50 shadow-md"
                : "border-gray-200 hover:border-teal-200 hover:bg-gray-50"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${
                userType === "touriste"
                  ? "bg-gradient-to-br from-teal-500 to-teal-400 text-white shadow-md"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <UserIcon className="h-8 w-8" />
            </div>
            <h3 className="text-base font-medium">Touriste</h3>
            <p className="text-xs text-gray-500 mt-1 text-center">Je cherche des guides</p>
          </button>

          <button
            onClick={() => setUserType("guide")}
            className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center ${
              userType === "guide"
                ? "border-teal-500 bg-teal-50 shadow-md"
                : "border-gray-200 hover:border-teal-200 hover:bg-gray-50"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${
                userType === "guide"
                  ? "bg-gradient-to-br from-teal-500 to-teal-400 text-white shadow-md"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <MapIcon className="h-8 w-8" />
            </div>
            <h3 className="text-base font-medium">Guide</h3>
            <p className="text-xs text-gray-500 mt-1 text-center">Je propose mes services</p>
          </button>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleNext}
            disabled={!userType}
            className={`w-full py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium ${
              userType
                ? "bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continuer
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
