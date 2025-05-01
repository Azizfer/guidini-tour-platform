"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

// Importer les composants modulaires
import { UserTypeSelection, LoginForm, SuccessAnimation } from "./ModalComp/CommonSteps"
import { TouristeBasicInfo, TouristePersonalInfo, TouristePreferences } from "./ModalComp/TouristeSteps"
import { GuideBasicInfo, GuidePersonalInfo, GuideExpertise } from "./ModalComp/GuideSteps"

// Définir les étapes d'inscription
type SignupStep =
  | "userType"
  | "personalInfo"
  | "touristBasicInfo"
  | "touristPreferences"
  | "guideBasicInfo"
  | "guideExpertise"
  | "success"

interface ModalProps {
  isOpen: boolean
  closeModal: () => void
}

export default function Modal({ isOpen, closeModal }: ModalProps) {
  // États principaux
  const [activeTab, setActiveTab] = useState("login")
  const [signupStep, setSignupStep] = useState<SignupStep>("userType")
  const [showSuccess, setShowSuccess] = useState(false)

  // États pour l'utilisateur
  const [userType, setUserType] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [languages, setLanguages] = useState<string[]>([])
  const [documents, setDocuments] = useState<File[]>([])
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)

  // États pour le guide
  const [idCard, setIdCard] = useState<File | null>(null)
  const [certificate, setCertificate] = useState<File | null>(null)

  // États pour les préférences touriste
  const [travelPurpose, setTravelPurpose] = useState<string[]>([])
  const [travelCompanions, setTravelCompanions] = useState<string[]>([])
  const [budget, setBudget] = useState<string[]>([])

  // États pour la vérification
  const [isVerifying, setIsVerifying] = useState(false)

  // Réinitialiser le formulaire quand le modal est fermé
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setActiveTab("login")
        setSignupStep("userType")
        setUserType("")
        setName("")
        setEmail("")
        setPassword("")
        setLanguages([])
        setDocuments([])
        setProfileImage(null)
        setProfilePhotoPreview(null)
        setIdCard(null)
        setCertificate(null)
        setTravelPurpose([])
        setTravelCompanions([])
        setBudget([])
        setIsVerifying(false)
        setShowSuccess(false)
      }, 300)
    }
  }, [isOpen])

  // Logique de navigation entre les étapes
  const nextStep = () => {
    if (signupStep === "userType") {
      if (userType === "touriste") {
        setSignupStep("touristBasicInfo")
      } else {
        setSignupStep("guideBasicInfo")
      }
    } else if (signupStep === "touristBasicInfo") {
      setSignupStep("personalInfo")
    } else if (signupStep === "guideBasicInfo") {
      setSignupStep("personalInfo")
    } else if (signupStep === "personalInfo") {
      if (userType === "touriste") {
        setSignupStep("touristPreferences")
      } else {
        setSignupStep("guideExpertise")
      }
    } else if (signupStep === "touristPreferences" || signupStep === "guideExpertise") {
      // Afficher directement le succès sans étape de vérification
      completeRegistration()
    }
  }

  const prevStep = () => {
    if (signupStep === "touristBasicInfo" || signupStep === "guideBasicInfo") {
      setSignupStep("userType")
    } else if (signupStep === "personalInfo") {
      if (userType === "touriste") {
        setSignupStep("touristBasicInfo")
      } else {
        setSignupStep("guideBasicInfo")
      }
    } else if (signupStep === "touristPreferences" || signupStep === "guideExpertise") {
      setSignupStep("personalInfo")
    }
  }

  // Compléter l'inscription directement sans vérification
  const completeRegistration = () => {
    setIsVerifying(true)
    setShowSuccess(true)

    // Préparer les données utilisateur avec l'image de profil si disponible
    let profileImageUrl = ""
    if (profileImage) {
      profileImageUrl = URL.createObjectURL(profileImage)
    }

    // Simuler la mise à jour du Header
    window.dispatchEvent(
      new CustomEvent("userLoggedIn", {
        detail: {
          email,
          name,
          userType,
          profileImage: profileImageUrl,
          preferences:
            userType === "touriste"
              ? {
                  travelPurpose,
                  travelCompanions,
                  budget,
                }
              : null,
        },
      }),
    )

    // Laisser le temps de voir l'animation de succès
    setTimeout(() => {
      closeModal()
      setShowSuccess(false)
    }, 3000)
  }

  // Gérer la connexion
  const handleLogin = () => {
    setIsVerifying(true)
    setShowSuccess(true)

    // Simuler la mise à jour du Header
    window.dispatchEvent(
      new CustomEvent("userLoggedIn", {
        detail: { email, name: "Utilisateur", userType: "touriste" },
      }),
    )

    setTimeout(() => {
      closeModal()
      setShowSuccess(false)
    }, 2000)
  }

  // Rendu conditionnel des étapes d'inscription
  const renderSignupStep = () => {
    switch (signupStep) {
      case "userType":
        return <UserTypeSelection userType={userType} setUserType={setUserType} nextStep={nextStep} />

      case "touristBasicInfo":
        return (
          <TouristeBasicInfo
            name={name}
            setName={setName}
            profileImage={profileImage}
            setProfileImage={setProfileImage}
            profilePhotoPreview={profilePhotoPreview}
            setProfilePhotoPreview={setProfilePhotoPreview}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        )

      case "guideBasicInfo":
        return (
          <GuideBasicInfo
            name={name}
            setName={setName}
            profilePhoto={profileImage}
            setProfilePhoto={setProfileImage}
            profilePhotoPreview={profilePhotoPreview}
            setProfilePhotoPreview={setProfilePhotoPreview}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        )

      case "personalInfo":
        if (userType === "touriste") {
          return (
            <TouristePersonalInfo
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              languages={languages}
              setLanguages={setLanguages}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          )
        } else {
          return (
            <GuidePersonalInfo
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              languages={languages}
              setLanguages={setLanguages}
              idCard={idCard}
              setIdCard={setIdCard}
              certificate={certificate}
              setCertificate={setCertificate}
              prevStep={prevStep}
              nextStep={nextStep}
            />
          )
        }

      case "touristPreferences":
        return (
          <TouristePreferences
            travelPurpose={travelPurpose}
            setTravelPurpose={setTravelPurpose}
            travelCompanions={travelCompanions}
            setTravelCompanions={setTravelCompanions}
            budget={budget}
            setBudget={setBudget}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        )

      case "guideExpertise":
        return (
          <GuideExpertise documents={documents} setDocuments={setDocuments} prevStep={prevStep} nextStep={nextStep} />
        )

      default:
        return null
    }
  }

  // Rendu du Modal
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={closeModal} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative min-h-screen w-full flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden my-8">
                {/* Bouton de fermeture */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>

                {/* En-tête avec dégradé amélioré */}
                <div className="bg-teal-500 pt-8 pb-10 px-6 relative overflow-hidden">
                  {/* Logo avec ombre et effet */}
                  <div className="flex justify-center relative z-10">
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative"
                    >
                      <img
                        src="/placeholder.svg?height=80&width=200&text=Guidini"
                        alt="Guidini"
                        className="h-20 relative z-10 drop-shadow-lg"
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Contenu du modal */}
                <div className="p-6">
                  {showSuccess ? (
                    <SuccessAnimation message={userType ? "Inscription réussie !" : "Connexion réussie !"} />
                  ) : (
                    <Tabs
                      defaultValue={activeTab}
                      onValueChange={(value) => {
                        setActiveTab(value)
                        if (value === "signup") {
                          setSignupStep("userType")
                        }
                      }}
                    >
                      <TabsList className="grid grid-cols-2 mb-6">
                        <TabsTrigger
                          value="login"
                          className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
                        >
                          Connexion
                        </TabsTrigger>
                        <TabsTrigger
                          value="signup"
                          className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
                        >
                          Inscription
                        </TabsTrigger>
                      </TabsList>

                      {/* Connexion */}
                      <TabsContent value="login">
                        <LoginForm
                          email={email}
                          setEmail={setEmail}
                          password={password}
                          setPassword={setPassword}
                          isVerifying={isVerifying}
                          handleLogin={handleLogin}
                        />
                      </TabsContent>

                      {/* Inscription */}
                      <TabsContent value="signup">{renderSignupStep()}</TabsContent>
                    </Tabs>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
