"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Check, User, Users } from "lucide-react"
import { motion } from "framer-motion"

export function UserTypeSelection({
  userType,
  setUserType,
  nextStep,
}: {
  userType: string
  setUserType: (type: string) => void
  nextStep: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Choisissez votre profil</h3>
        <p className="text-sm text-gray-500 mt-1">Sélectionnez le type de compte que vous souhaitez créer</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setUserType("touriste")}
          className={`cursor-pointer rounded-lg p-4 border-2 transition-all ${
            userType === "touriste"
              ? "border-teal-500 bg-teal-50"
              : "border-gray-200 hover:border-teal-200 hover:bg-teal-50/30"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                userType === "touriste" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              <User size={24} />
            </div>
            <h4 className="font-medium text-gray-800">Touriste</h4>
            <p className="text-xs text-gray-500 mt-1">Je cherche des guides et des expériences</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setUserType("guide")}
          className={`cursor-pointer rounded-lg p-4 border-2 transition-all ${
            userType === "guide"
              ? "border-teal-500 bg-teal-50"
              : "border-gray-200 hover:border-teal-200 hover:bg-teal-50/30"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                userType === "guide" ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              <Users size={24} />
            </div>
            <h4 className="font-medium text-gray-800">Guide</h4>
            <p className="text-xs text-gray-500 mt-1">Je propose mes services de guide touristique</p>
          </div>
        </motion.div>
      </div>

      <div className="pt-4">
        <Button onClick={nextStep} disabled={!userType} className="w-full bg-teal-500 hover:bg-teal-600 text-white">
          Continuer
        </Button>
      </div>
    </div>
  )
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  isVerifying,
  handleLogin,
}: {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  isVerifying: boolean
  handleLogin: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="password" className="text-gray-700">
            Mot de passe
          </Label>
          <a href="#" className="text-xs text-teal-600 hover:text-teal-800">
            Mot de passe oublié?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
          required
        />
      </div>

      <Button
        onClick={handleLogin}
        disabled={!email || !password || isVerifying}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white mt-2"
      >
        {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Se connecter
      </Button>

      <div className="text-center text-sm text-gray-500 mt-4">
        <span>Vous n'avez pas de compte? </span>
        <a href="#" className="text-teal-600 hover:text-teal-800">
          Inscrivez-vous
        </a>
      </div>
    </div>
  )
}

export function SuccessAnimation({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center mb-4"
      >
        <Check className="h-8 w-8 text-white" />
      </motion.div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{message}</h3>
      <p className="text-gray-500 text-center">Vous allez être redirigé...</p>
    </motion.div>
  )
}
