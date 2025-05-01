"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, ArrowLeft, ArrowRight } from "lucide-react"

export function TouristeBasicInfo({
  name,
  setName,
  profileImage,
  setProfileImage,
  profilePhotoPreview,
  setProfilePhotoPreview,
  prevStep,
  nextStep,
}: {
  name: string
  setName: (name: string) => void
  profileImage: File | null
  setProfileImage: (file: File | null) => void
  profilePhotoPreview: string | null
  setProfilePhotoPreview: (preview: string | null) => void
  prevStep: () => void
  nextStep: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfilePhotoPreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Informations de base</h3>
        <p className="text-sm text-gray-500 mt-1">Commençons par quelques informations simples</p>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div
          className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-4 cursor-pointer relative"
          onClick={() => fileInputRef.current?.click()}
        >
          {profilePhotoPreview ? (
            <img src={profilePhotoPreview || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Camera className="h-8 w-8 text-gray-400" />
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-medium">Changer</span>
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          aria-label="Upload profile photo"
        />
        <p className="text-sm text-gray-500">Photo de profil (optionnelle)</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700">
            Nom complet
          </Label>
          <Input
            id="name"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            required
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={prevStep} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button onClick={nextStep} disabled={!name} className="bg-teal-500 hover:bg-teal-600 text-white">
          Continuer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function TouristePersonalInfo({
  email,
  setEmail,
  password,
  setPassword,
  languages,
  setLanguages,
  prevStep,
  nextStep,
}: {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  languages: string[]
  setLanguages: (languages: string[]) => void
  prevStep: () => void
  nextStep: () => void
}) {
  const [selectedLanguage, setSelectedLanguage] = useState("")

  const addLanguage = () => {
    if (selectedLanguage && !languages.includes(selectedLanguage)) {
      setLanguages([...languages, selectedLanguage])
      setSelectedLanguage("")
    }
  }

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang))
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Informations personnelles</h3>
        <p className="text-sm text-gray-500 mt-1">Configurez votre compte</p>
      </div>

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
          <Label htmlFor="password" className="text-gray-700">
            Mot de passe
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
            required
          />
          <p className="text-xs text-gray-500">Le mot de passe doit contenir au moins 8 caractères</p>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700">Langues parlées</Label>
          <div className="flex gap-2">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Sélectionner une langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="français">Français</SelectItem>
                <SelectItem value="anglais">Anglais</SelectItem>
                <SelectItem value="arabe">Arabe</SelectItem>
                <SelectItem value="espagnol">Espagnol</SelectItem>
                <SelectItem value="allemand">Allemand</SelectItem>
                <SelectItem value="italien">Italien</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={addLanguage}
              disabled={!selectedLanguage}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Ajouter
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {languages.map((lang) => (
              <div key={lang} className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full flex items-center">
                <span>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                <button
                  type="button"
                  onClick={() => removeLanguage(lang)}
                  className="ml-1 text-teal-600 hover:text-teal-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={prevStep} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={nextStep}
          disabled={!email || !password || password.length < 8}
          className="bg-teal-500 hover:bg-teal-600 text-white"
        >
          Continuer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function TouristePreferences({
  travelPurpose,
  setTravelPurpose,
  travelCompanions,
  setTravelCompanions,
  budget,
  setBudget,
  prevStep,
  nextStep,
}: {
  travelPurpose: string[]
  setTravelPurpose: (purpose: string[]) => void
  travelCompanions: string[]
  setTravelCompanions: (companions: string[]) => void
  budget: string[]
  setBudget: (budget: string[]) => void
  prevStep: () => void
  nextStep: () => void
}) {
  const [selectedPurpose, setSelectedPurpose] = useState("")
  const [selectedCompanion, setSelectedCompanion] = useState("")
  const [selectedBudget, setSelectedBudget] = useState("")

  const addPurpose = () => {
    if (selectedPurpose && !travelPurpose.includes(selectedPurpose)) {
      setTravelPurpose([...travelPurpose, selectedPurpose])
      setSelectedPurpose("")
    }
  }

  const removePurpose = (purpose: string) => {
    setTravelPurpose(travelPurpose.filter((p) => p !== purpose))
  }

  const addCompanion = () => {
    if (selectedCompanion && !travelCompanions.includes(selectedCompanion)) {
      setTravelCompanions([...travelCompanions, selectedCompanion])
      setSelectedCompanion("")
    }
  }

  const removeCompanion = (companion: string) => {
    setTravelCompanions(travelCompanions.filter((c) => c !== companion))
  }

  const addBudget = () => {
    if (selectedBudget && !budget.includes(selectedBudget)) {
      setBudget([...budget, selectedBudget])
      setSelectedBudget("")
    }
  }

  const removeBudget = (budgetItem: string) => {
    setBudget(budget.filter((b) => b !== budgetItem))
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Vos préférences</h3>
        <p className="text-sm text-gray-500 mt-1">Aidez-nous à personnaliser votre expérience</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="travelPurpose" className="text-gray-700">
            Objectifs du voyage (plusieurs choix possibles)
          </Label>
          <div className="flex gap-2">
            <Select value={selectedPurpose} onValueChange={setSelectedPurpose}>
              <SelectTrigger id="travelPurpose" className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Sélectionner un objectif" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="détente">Détente et relaxation</SelectItem>
                <SelectItem value="culture">Découverte culturelle</SelectItem>
                <SelectItem value="aventure">Aventure et sports</SelectItem>
                <SelectItem value="gastronomie">Gastronomie</SelectItem>
                <SelectItem value="affaires">Voyage d'affaires</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={addPurpose}
              disabled={!selectedPurpose}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {travelPurpose.map((purpose) => (
              <div key={purpose} className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full flex items-center">
                <span>{purpose.charAt(0).toUpperCase() + purpose.slice(1)}</span>
                <button
                  type="button"
                  onClick={() => removePurpose(purpose)}
                  className="ml-1 text-teal-600 hover:text-teal-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="travelCompanions" className="text-gray-700">
            Avec qui voyagez-vous généralement? (plusieurs choix possibles)
          </Label>
          <div className="flex gap-2">
            <Select value={selectedCompanion} onValueChange={setSelectedCompanion}>
              <SelectTrigger
                id="travelCompanions"
                className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              >
                <SelectValue placeholder="Sélectionner une option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seul">Seul(e)</SelectItem>
                <SelectItem value="couple">En couple</SelectItem>
                <SelectItem value="famille">En famille</SelectItem>
                <SelectItem value="amis">Entre amis</SelectItem>
                <SelectItem value="groupe">En groupe organisé</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={addCompanion}
              disabled={!selectedCompanion}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {travelCompanions.map((companion) => (
              <div
                key={companion}
                className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full flex items-center"
              >
                <span>{companion.charAt(0).toUpperCase() + companion.slice(1)}</span>
                <button
                  type="button"
                  onClick={() => removeCompanion(companion)}
                  className="ml-1 text-teal-600 hover:text-teal-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget" className="text-gray-700">
            Budget approximatif par jour (en DT) (plusieurs choix possibles)
          </Label>
          <div className="flex gap-2">
            <Select value={selectedBudget} onValueChange={setSelectedBudget}>
              <SelectTrigger id="budget" className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                <SelectValue placeholder="Sélectionner un budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="économique">Moins de 100 DT</SelectItem>
                <SelectItem value="modéré">100 - 300 DT</SelectItem>
                <SelectItem value="confort">300 - 500 DT</SelectItem>
                <SelectItem value="luxe">Plus de 500 DT</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={addBudget}
              disabled={!selectedBudget}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {budget.map((budgetItem) => (
              <div
                key={budgetItem}
                className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full flex items-center"
              >
                <span>{budgetItem.charAt(0).toUpperCase() + budgetItem.slice(1)}</span>
                <button
                  type="button"
                  onClick={() => removeBudget(budgetItem)}
                  className="ml-1 text-teal-600 hover:text-teal-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={prevStep} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button onClick={nextStep} className="bg-teal-500 hover:bg-teal-600 text-white">
          Terminer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
