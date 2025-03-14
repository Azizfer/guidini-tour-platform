"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface ModalProps {
  isOpen: boolean
  closeModal: () => void
}

type UserType = "touriste" | "Guide"

const preferences = {
  "Nature & Activités de plein air": ["Randonnée", "Camping", "Safaris", "Plage", "Alpinisme"],
  "Culture & Histoire": ["Musées", "Sites historiques", "Galeries d'art", "Visites religieuses", "Festivals locaux"],
  "Détente & Loisirs": ["Retraites spa", "Croisières", "Retraites yoga", "Resorts de luxe"],
  Gastronomie: [
    "Visites culinaires",
    "Cours de cuisine",
    "Cuisine locale",
    "Street food",
    "Restaurants gastronomiques",
  ],
  "Exploration urbaine": ["Visites de ville", "Shopping", "Vie nocturne", "Architecture", "Parcs à thème"],
}

export default function Modal({ isOpen, closeModal }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login")
  const [userType, setUserType] = useState<UserType | null>(null)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [qualificationFile, setQualificationFile] = useState<File | null>(null)
  const [step, setStep] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Logique de soumission
    console.log({
      userType,
      email,
      name,
      password,
      interests,
      qualificationFile,
    })

    // Simuler une connexion réussie
    closeModal()
  }

  const toggleInterest = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={closeModal}>
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </Button>

        <div className="flex justify-center pt-6">
          <img src="/images/logo.png" alt="Guidini" className="h-16" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {step === 1 && activeTab !== "forgot" && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white">
                  {activeTab === "login" ? "Connexion" : "Inscription"}
                </h2>

                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">Je suis un:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Card
                      className={`cursor-pointer transition-all ${
                        userType === "touriste"
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setUserType("touriste")}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <span className="font-medium">Touriste</span>
                        {userType === "touriste" && (
                          <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all ${
                        userType === "Guide"
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "hover:border-gray-400"
                      }`}
                      onClick={() => setUserType("Guide")}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <span className="font-medium">Guide</span>
                        {userType === "Guide" && (
                          <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Button onClick={nextStep} disabled={!userType} className="w-full">
                  Suivant
                </Button>

                <div className="text-center space-y-2 pt-2">
                  {activeTab === "login" ? (
                    <>
                      <Button
                        variant="link"
                        className="text-sm text-blue-600 dark:text-blue-400"
                        onClick={() => setActiveTab("forgot")}
                      >
                        Mot de passe oublié ?
                      </Button>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Pas de compte ?{" "}
                        <Button
                          variant="link"
                          className="text-blue-600 dark:text-blue-400 p-0"
                          onClick={() => {
                            setActiveTab("signup")
                            setStep(1)
                          }}
                        >
                          S'inscrire
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Déjà un compte ?{" "}
                      <Button
                        variant="link"
                        className="text-blue-600 dark:text-blue-400 p-0"
                        onClick={() => {
                          setActiveTab("login")
                          setStep(1)
                        }}
                      >
                        Se connecter
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 || activeTab === "forgot" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-4">
                  {activeTab === "login"
                    ? "Connexion"
                    : activeTab === "signup"
                      ? "Inscription"
                      : "Récupération de mot de passe"}
                </h2>

                {activeTab === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom complet"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                {activeTab !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                )}

                {userType === "Guide" && activeTab === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualifications (Optionnel)</Label>
                    <Input
                      id="qualification"
                      type="file"
                      onChange={(e) => {
                        const files = (e.target as HTMLInputElement).files
                        setQualificationFile(files ? files[0] : null)
                      }}
                      className="cursor-pointer"
                    />
                  </div>
                )}

                {userType === "touriste" && activeTab === "signup" && (
                  <div className="space-y-3">
                    <Label>Intérêts (sélectionnez plusieurs)</Label>
                    <Accordion type="multiple" className="w-full">
                      {Object.entries(preferences).map(([category, items]) => (
                        <AccordionItem key={category} value={category}>
                          <AccordionTrigger className="text-sm font-medium py-2">{category}</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 gap-2 py-2">
                              {items.map((interest) => (
                                <div key={interest} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={interest}
                                    checked={interests.includes(interest)}
                                    onCheckedChange={() => toggleInterest(interest)}
                                  />
                                  <Label htmlFor={interest} className="text-sm cursor-pointer">
                                    {interest}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (activeTab === "forgot") {
                        setActiveTab("login")
                      } else {
                        prevStep()
                      }
                    }}
                  >
                    Retour
                  </Button>
                  <Button type="submit">
                    {activeTab === "login"
                      ? "Se connecter"
                      : activeTab === "signup"
                        ? "Créer un compte"
                        : "Envoyer le code"}
                  </Button>
                </div>
              </form>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

