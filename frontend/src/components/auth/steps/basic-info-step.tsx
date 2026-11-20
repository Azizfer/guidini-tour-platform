"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Upload, X, Check, Camera, AtSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

  // Calculate password strength
  const getStrength = (value: string): number => {
    if (!value) return 0
    return passwordRequirements.filter((req) => req.test(value)).length * 25
  }

  const strength = getStrength(password)
  const strengthLabel = strength <= 50 ? "Faible" : strength <= 75 ? "Moyen" : "Fort"

  // Get color based on strength
  const getStrengthColor = () => {
    if (strength <= 25) return "bg-red-500"
    if (strength <= 50) return "bg-orange-500"
    if (strength <= 75) return "bg-yellow-500"
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
    if (password && strength < 75) {
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
    } else if (strength < 75) {
      setPasswordError("Veuillez utiliser un mot de passe plus fort")
      hasError = true
    }

    if (hasError) {
      setError("Veuillez corriger les erreurs ci-dessous")
      return
    }

    onNext()
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Atmospheric effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5"></div>

      {/* Back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onBackToSignIn}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors text-white"
          aria-label="Retour à la connexion"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

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
              <p className="text-white text-2xl font-semibold mb-2 drop-shadow-lg">CRÉEZ VOTRE COMPTE</p>
              <p className="text-blue-100 text-base drop-shadow-md">Commençons par vos informations de base</p>
            </div>

            {/* Form Content */}
            <div className="space-y-5 backdrop-blur-sm">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-400/20 border border-red-400/30 text-white rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Profile Image Upload */}
              <div className="flex flex-col items-center mb-4">
                <Label htmlFor="profile-image" className="text-sm font-medium text-white drop-shadow-md mb-2">
                  Photo de profil (optionnel)
                </Label>
                <div className="relative mb-2 group">
                  <div
                    className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center border-2 transition-all duration-300 ${
                      profileImagePreview
                        ? "border-white/50"
                        : "border-white/30 bg-white/10 group-hover:border-white/40"
                    }`}
                  >
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview || "/placeholder.svg"}
                        alt="Aperçu du profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white/80 group-hover:text-white transition-colors">
                        <Camera className="h-6 w-6 mb-1" />
                        <span className="text-xs">Ajouter</span>
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 bg-white text-blue-700 p-1.5 rounded-full cursor-pointer hover:bg-white/90 transition-all duration-300 shadow-lg"
                  >
                    <Upload className="h-3 w-3" />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-xs text-white/70">JPG, PNG ou GIF. Max 2MB.</p>
              </div>

              <div className="space-y-4">
                {/* Name Input */}
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium text-white drop-shadow-md">
                    Prénom et nom
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Votre nom complet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full h-11 rounded-xl border-2 bg-white/95 backdrop-blur-sm focus:ring-2 focus:ring-white/30 transition-all text-gray-800 placeholder:text-gray-500 shadow-lg ${
                      nameError ? "border-red-300 focus:border-red-400" : "border-white/20 focus:border-white"
                    }`}
                    autoComplete="off"
                  />
                  {nameError && <p className="text-xs text-red-200 mt-1">{nameError}</p>}
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm font-medium text-white drop-shadow-md">
                    Email
                  </Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 h-11 rounded-xl border-2 bg-white/95 backdrop-blur-sm focus:ring-2 focus:ring-white/30 transition-all text-gray-800 placeholder:text-gray-500 shadow-lg ${
                        emailError ? "border-red-300 focus:border-red-400" : "border-white/20 focus:border-white"
                      }`}
                      autoComplete="off"
                    />
                  </div>
                  {emailError && <p className="text-xs text-red-200 mt-1">{emailError}</p>}
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm font-medium text-white drop-shadow-md">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pr-10 h-11 rounded-xl border-2 bg-white/95 backdrop-blur-sm focus:ring-2 focus:ring-white/30 transition-all text-gray-800 placeholder:text-gray-500 shadow-lg ${
                        passwordError ? "border-red-300 focus:border-red-400" : "border-white/20 focus:border-white"
                      }`}
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
                  {passwordError && <p className="text-xs text-red-200 mt-1">{passwordError}</p>}

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getStrengthColor()} transition-all duration-500 ease-out`}
                          style={{ width: `${strength}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/80">
                        Force: <span className="font-medium">{strengthLabel}</span>
                      </p>

                      {/* Password Requirements */}
                      <div className="flex flex-wrap gap-2 text-xs text-white/70 pt-1">
                        {passwordRequirements.map(({ label, test }) => (
                          <div key={label} className="flex items-center gap-1">
                            {test(password) ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <X className="w-3 h-3 text-white/40" />
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
