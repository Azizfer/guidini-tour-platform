"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { Progress } from "@/components/ui/progress"

// Step components
import BasicInfoStep from "./auth/steps/basic-info-step"
import UserTypeStep from "./auth/steps/user-type-step"
import TouristPreferencesStep from "./auth/steps/tourist-prefrences"
import TouristTravelDetailsStep from "./auth/steps/tourist-travel-details-step"
import GuideExpertiseStep from "./auth/steps/guide-expertise-step"
import GuideLanguagesRegionsStep from "./auth/steps/guide-languages-regions-step"
import GuideDocumentsStep from "./auth/steps/guide-documents-step"
import EmailVerificationStep from "./auth/steps/email-verification-step"
import SuccessStep from "./auth/steps/success-step"

interface SignUpProcessProps {
  onBackToSignIn: () => void
}

export type SignUpStep =
  | "basicInfo"
  | "userType"
  | "touristPreferences"
  | "touristTravelDetails"
  | "guideExpertise"
  | "guideLanguagesRegions"
  | "guideDocuments"
  | "emailVerification"
  | "success"

export type UserType = "touriste" | "guide" | ""

export default function SignUpProcess({ onBackToSignIn }: SignUpProcessProps) {
  const [currentStep, setCurrentStep] = useState<SignUpStep>("basicInfo")
  const [direction, setDirection] = useState(0)
  const { login } = useAuth()
  const [progress, setProgress] = useState(0)

  // Form data
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("") // Empty password initially
  const [userType, setUserType] = useState<UserType>("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [languages, setLanguages] = useState<string[]>([])
  const [preferences, setPreferences] = useState<string[]>([])
  const [travelCompanions, setTravelCompanions] = useState<string[]>([])
  const [budget, setBudget] = useState<string[]>([])
  const [expertise, setExpertise] = useState<string[]>([])
  const [coveredGovernorates, setCoveredGovernorates] = useState<string[]>([])
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0)
  const [description, setDescription] = useState<string>("")
  const [idCard, setIdCard] = useState<File | null>(null)
  const [certificate, setCertificate] = useState<File | null>(null)
  const [registrationError, setRegistrationError] = useState<string>("")
  const [verificationToken, setVerificationToken] = useState<string>("")
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false)

  // Get steps based on user type
  const getSteps = () => {
    const commonSteps = ["basicInfo", "userType"]
    const touristSteps = [...commonSteps, "touristPreferences", "touristTravelDetails", "emailVerification", "success"]
    const guideSteps = [...commonSteps, "guideExpertise", "guideLanguagesRegions", "guideDocuments", "emailVerification", "success"]

    return userType === "touriste" ? touristSteps : userType === "guide" ? guideSteps : commonSteps
  }

  // Update progress when step changes
  useEffect(() => {
    const steps = getSteps()
    const currentIndex = steps.indexOf(currentStep)
    const newProgress = (currentIndex / (steps.length - 1)) * 100

    // Animate progress
    const timer = setTimeout(() => {
      setProgress(newProgress)
    }, 300)

    return () => clearTimeout(timer)
  }, [currentStep, userType])

  // Navigation functions
  const goToNext = () => {
    setDirection(1)
    const steps = getSteps()
    const currentIndex = steps.indexOf(currentStep)

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as SignUpStep)
    }
  }

  const goToPrev = () => {
    setDirection(-1)
    const steps = getSteps()
    const currentIndex = steps.indexOf(currentStep)

    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as SignUpStep)
    }
  }

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      {/* Header - Only back button */}
      {currentStep !== "basicInfo" && (
        <div className="fixed top-0 left-0 right-0 z-10 py-3 px-3">
          <button
            onClick={goToPrev}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Retour"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 pt-12 pb-20">
        <div className="max-w-sm mx-auto px-4">
          <AnimatePresence custom={direction} initial={false} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full"
            >
              {currentStep === "basicInfo" && (
                <BasicInfoStep
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  profileImage={profileImage}
                  setProfileImage={setProfileImage}
                  profileImagePreview={profileImagePreview}
                  setProfileImagePreview={setProfileImagePreview}
                  onNext={goToNext}
                  onBackToSignIn={onBackToSignIn}
                />
              )}

              {currentStep === "userType" && (
                <UserTypeStep
                  name={name}
                  userType={userType}
                  setUserType={setUserType}
                  onNext={goToNext}
                  onPrev={goToPrev}
                />
              )}

              {currentStep === "touristPreferences" && (
                <TouristPreferencesStep
                  preferences={preferences}
                  setPreferences={setPreferences}
                  languages={languages}
                  setLanguages={setLanguages}
                  onNext={goToNext}
                  onPrev={goToPrev}
                />
              )}

              {currentStep === "touristTravelDetails" && (
                <TouristTravelDetailsStep
                  travelCompanions={travelCompanions}
                  setTravelCompanions={setTravelCompanions}
                  budget={budget}
                  setBudget={setBudget}
                  onNext={goToNext}
                  onPrev={goToPrev}
                />
              )}

              {currentStep === "guideExpertise" && (
                <GuideExpertiseStep
                  expertise={expertise}
                  setExpertise={setExpertise}
                  yearsOfExperience={yearsOfExperience}
                  setYearsOfExperience={setYearsOfExperience}
                  description={description}
                  setDescription={setDescription}
                  onNext={goToNext}
                  onPrev={goToPrev}
                />
              )}

              {currentStep === "guideLanguagesRegions" && (
                <GuideLanguagesRegionsStep
                  languages={languages}
                  setLanguages={setLanguages}
                  coveredGovernorates={coveredGovernorates}
                  setCoveredGovernorates={setCoveredGovernorates}
                  onNext={goToNext}
                  onPrev={goToPrev}
                />
              )}

              {currentStep === "guideDocuments" && (
                <GuideDocumentsStep
                  idCard={idCard}
                  setIdCard={setIdCard}
                  certificate={certificate}
                  setCertificate={setCertificate}
                  onNext={async () => {
                    try {
                      // Reset any previous errors
                      setRegistrationError("");
                      
                      // Import auth service for pre-registration
                      const authService = (await import('@/services/authService')).default;
                      
                      // Send pre-registration request
                      await authService.preRegister(email, name);
                      setIsEmailSent(true);
                      goToNext();
                    } catch (error: any) {
                      console.error("Pre-registration error:", error);
                      setRegistrationError(error.response?.data?.error || "Une erreur est survenue lors de l'envoi du code de vérification.");
                    }
                  }}
                  onPrev={goToPrev}
                />
              )}

              {currentStep === "emailVerification" && (
                <EmailVerificationStep
                  email={email}
                  name={name}
                  onVerificationSuccess={(token) => {
                    setVerificationToken(token);
                    goToNext();
                  }}
                  onPrev={goToPrev}
                />
              )}

              {currentStep === "success" && (
                <SuccessStep
                  onFinish={async () => {
                    try {
                      // Reset any previous errors
                      setRegistrationError("");
                      
                      // Import auth service for registration
                      const authService = (await import('@/services/authService')).default;
                      
                      // Prepare registration data
                      const registrationData = {
                        name,
                        email,
                        password,
                        userType,
                        profileImage,
                        languages,
                        travelPurpose: preferences, // Map preferences to travelPurpose
                        travelCompanions,
                        budget,
                        // Guide specific fields
                        expertise,
                        coveredGovernorates,
                        yearsOfExperience,
                        description,
                        idCard,
                        certificate
                      };
                      
                      console.log("Sending registration data to API:", {
                        ...registrationData,
                        password: "[HIDDEN]",
                        profileImage: profileImage ? "Image uploaded" : null,
                        idCard: idCard ? "ID Card uploaded" : null,
                        certificate: certificate ? "Certificate uploaded" : null,
                      });

                      try {
                        // Send registration data to API with verification token
                        const response = await authService.register(registrationData, verificationToken);
                        console.log("Registration successful:", response);
                        
                        // Redirect to login page after short delay
                        setTimeout(() => {
                          onBackToSignIn();
                        }, 1500);
                      } catch (error) {
                        // Type guard for AxiosError
                        const axiosError = error as { 
                          response?: { 
                            data?: any, 
                            status?: number, 
                            statusText?: string 
                          },
                          message?: string
                        };
                        console.error("Registration error:", axiosError);
                        
                        // Handle specific error cases
                        if (axiosError.response?.data) {
                          const errorData = axiosError.response.data;
                          
                          // Check for duplicate username error
                          if (errorData.field === 'username' || (errorData.error && errorData.error.includes('nom d\'utilisateur'))) {
                            setRegistrationError("Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre.");
                            return;
                          }
                          
                          // Check for duplicate email error
                          if (errorData.field === 'email' || (errorData.error && errorData.error.includes('email'))) {
                            setRegistrationError("Cette adresse email est déjà utilisée. Veuillez en utiliser une autre.");
                            return;
                          }
                          
                          // Generic error message from server
                          setRegistrationError(errorData.error || "Une erreur est survenue lors de l'inscription.");
                        } else {
                          // Network or other errors
                          // Type assertion for error to access message property safely
                          const errorMessage = axiosError.message || "Une erreur de connexion est survenue.";
                          setRegistrationError(errorMessage);
                        }
                      }
                    } catch (error) {
                      // Type guard for the error
                      const unknownError = error as { message?: string };
                      console.error("Registration process error:", unknownError);
                      setRegistrationError("Une erreur inattendue est survenue. Veuillez réessayer.");
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-4">
        <div className="max-w-sm mx-auto px-4">
          <Progress value={progress} className="h-2 w-full" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Étape {getSteps().indexOf(currentStep) + 1}</span>
            <span>{getSteps().length} étapes</span>
          </div>
        </div>
      </div>
    </div>
  )
}
