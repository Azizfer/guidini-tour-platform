"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Upload, X, Check, Camera, AtSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import HandWrittenTitle from "@/components/ui/hand-written-title"

interface BasicInfoStepProps {
  name: string
  setName: (name: string) => void
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  profileImage: File | null
  setProfileImage: (file: File | null) => void
  profileImagePreview: string | null
  setProfileImagePreview: (preview: string | null) => void
  onNext: () => void
  onBackToSignIn: () => void
}

const passwordRequirements = [
  { label: "8+ caractères", test: (v: string) => v.length >= 8 },
  { label: "Chiffre", test: (v: string) => /\d/.test(v) },
  { label: "Minuscule", test: (v: string) => /[a-z]/.test(v) },
  { label: "Majuscule", test: (v: string) => /[A-Z]/.test(v) },
  // Special character requirement removed
]

export default function BasicInfoStep({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  profileImage,
  setProfileImage,
  profileImagePreview,
  setProfileImagePreview,
  onNext,
  onBackToSignIn,
}: BasicInfoStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [termsError, setTermsError] = useState("")

  // Calculate password strength
  const getStrength = (value: string): number => {
    if (!value) return 0
    return passwordRequirements.filter((req) => req.test(value)).length * 20
  }

  const strength = getStrength(password)
  const strengthLabel = strength <= 40 ? "Faible" : strength <= 80 ? "Moyen" : "Fort"

  // Get color based on strength
  const getStrengthColor = () => {
    if (strength <= 20) return "bg-red-500"
    if (strength <= 40) return "bg-orange-500"
    if (strength <= 60) return "bg-yellow-500"
    if (strength <= 80) return "bg-blue-500"
    return "bg-green-500"
  }

  // Validate email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Real-time validation
  useEffect(() => {
    if (name && name.length < 3) {
      setNameError("Le nom doit contenir au moins 3 caractères")
    } else {
      setNameError("")
    }
  }, [name])

  useEffect(() => {
    if (email && !isValidEmail(email)) {
      setEmailError("Veuillez entrer une adresse email valide")
    } else {
      setEmailError("")
    }
  }, [email])

  useEffect(() => {
    if (password && strength < 60) {
      setPasswordError("Le mot de passe n'est pas assez fort")
    } else {
      setPasswordError("")
    }
  }, [password, strength])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setError("La taille de l'image ne doit pas dépasser 2MB")
      return
    }

    setError("")
    setProfileImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleNext = async () => {
    // Reset all errors
    setError("")
    setNameError("")
    setEmailError("")
    setPasswordError("")
    setTermsError("")

    // Validate all fields
    let hasError = false

    if (!name.trim()) {
      setNameError("Veuillez entrer votre nom")
      hasError = true
    } else if (name.length < 3) {
      setNameError("Le nom doit contenir au moins 3 caractères")
      hasError = true
    }

    if (!email.trim()) {
      setEmailError("Veuillez entrer votre email")
      hasError = true
    } else if (!isValidEmail(email)) {
      setEmailError("Veuillez entrer une adresse email valide")
      hasError = true
    }

    if (!password) {
      setPasswordError("Veuillez entrer un mot de passe")
      hasError = true
    } else if (strength < 60) {
      setPasswordError("Veuillez utiliser un mot de passe plus fort")
      hasError = true
    }

    if (hasError) {
      setError("Veuillez corriger les erreurs ci-dessous")
      return
    }
    
    // Check if email already exists
    try {
      const response = await fetch('http://localhost:5001/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error && data.error.includes('email')) {
          setEmailError("Cette adresse email est déjà utilisée")
          setError("Veuillez utiliser une autre adresse email")
          return;
        }
        
        if (data.error && data.error.includes('nom')) {
          setNameError("Ce nom d'utilisateur est déjà utilisé")
          setError("Veuillez utiliser un autre nom d'utilisateur")
          return;
        }
        
        // Generic error
        setError(data.error || "Une erreur est survenue lors de la vérification")
        return;
      }
    } catch (error) {
      console.error("Error checking email:", error);
      // Continue anyway if the check fails - we'll validate again on final submission
    }

    onNext()
  }

  return (
    <div className="flex flex-col items-center">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => window.location.href = '/'}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Retour à l'accueil"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <HandWrittenTitle
        title="Créez votre compte"
        subtitle="Commençons par vos informations de base"
        size="sm"
        className="mb-6"
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg w-full text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6 w-full"
      >
        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <Label htmlFor="profile-image" className="text-sm font-medium text-gray-700 mb-2">
            Photo de profil (optionnel)
          </Label>
          <div className="relative mb-3 group">
            <div
              className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center border-2 transition-all duration-300 ${
                profileImagePreview ? "border-teal-300" : "border-gray-200 bg-gray-50 group-hover:border-teal-200"
              }`}
            >
              {profileImagePreview ? (
                <img
                  src={profileImagePreview || "/placeholder.svg"}
                  alt="Aperçu du profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-teal-500 transition-colors">
                  <Camera className="h-8 w-8 mb-1" />
                  <span className="text-xs">Ajouter</span>
                </div>
              )}
            </div>
            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 bg-gradient-to-r from-teal-500 to-teal-400 text-white p-2 rounded-full cursor-pointer hover:shadow-md transition-all duration-300 hover:from-teal-600 hover:to-teal-500"
            >
              <Upload className="h-4 w-4" />
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <p className="text-xs text-gray-500">JPG, PNG ou GIF. Max 2MB.</p>
        </div>

        <div className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Prénom et nom
            </Label>
            <Input
              id="name"
              type="text"
              placeholder=""
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-lg transition-all ${
                nameError
                  ? "border-red-300 focus:border-red-400 focus:ring focus:ring-red-200"
                  : "border-gray-200 focus:border-teal-300 focus:ring focus:ring-teal-200"
              } focus:ring-opacity-50`}
              autoComplete="off"
            />
            {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="email"
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 rounded-lg transition-all ${
                  emailError
                    ? "border-red-300 focus:border-red-400 focus:ring focus:ring-red-200"
                    : "border-gray-200 focus:border-teal-300 focus:ring focus:ring-teal-200"
                } focus:ring-opacity-50`}
                autoComplete="off"
              />
            </div>
            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pr-10 rounded-lg transition-all ${
                  passwordError
                    ? "border-red-300 focus:border-red-400 focus:ring focus:ring-red-200"
                    : "border-gray-200 focus:border-teal-300 focus:ring focus:ring-teal-200"
                } focus:ring-opacity-50`}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Cacher le mot de passe" : "Montrer le mot de passe"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3 space-y-2">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStrengthColor()} transition-all duration-500 ease-out`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Force: <span className="font-medium">{strengthLabel}</span>
                </p>

                {/* Password Requirements - Horizontal Layout */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-1">
                  {passwordRequirements.map(({ label, test }) => (
                    <div key={label} className="flex items-center gap-1">
                      {test(password) ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
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
