"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { UserIcon, MapIcon } from "lucide-react"

export type UserType = "touriste" | "guide" | null

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
            <div className="text-center mb-8">
              <p className="text-white text-2xl font-semibold mb-2 drop-shadow-lg">Bonjour, {name}!</p>
              <p className="text-blue-100 text-base drop-shadow-md">Quel type d'utilisateur êtes-vous?</p>
            </div>

            {/* Form Content */}
            <div className="space-y-6 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setUserType("touriste")}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center backdrop-blur-sm ${
                    userType === "touriste"
                      ? "border-white bg-white/20 shadow-xl"
                      : "border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/15"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${
                      userType === "touriste" ? "bg-white text-blue-700 shadow-lg" : "bg-white/20 text-white"
                    }`}
                  >
                    <UserIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-medium text-white drop-shadow-md">Touriste</h3>
                  <p className="text-xs text-white/70 mt-1 text-center drop-shadow-sm">Je cherche des guides</p>
                </button>

                <button
                  onClick={() => setUserType("guide")}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center backdrop-blur-sm ${
                    userType === "guide"
                      ? "border-white bg-white/20 shadow-xl"
                      : "border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/15"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${
                      userType === "guide" ? "bg-white text-blue-700 shadow-lg" : "bg-white/20 text-white"
                    }`}
                  >
                    <MapIcon className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-medium text-white drop-shadow-md">Guide</h3>
                  <p className="text-xs text-white/70 mt-1 text-center drop-shadow-sm">Je propose mes services</p>
                </button>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleNext}
                  disabled={!userType}
                  className={`w-full h-12 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-base ${
                    userType
                      ? "bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-blue-600"
                      : "bg-white/20 text-white/50 cursor-not-allowed"
                  }`}
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
