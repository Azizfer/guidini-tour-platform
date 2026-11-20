"use client"

import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import GuideDocumentsStep from "@/components/auth/steps/guide-documents-step"
import EmailVerificationStep from "@/components/auth/steps/email-verification-step"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    userType: "guide"
  })

  const onNext = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const onPrev = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleVerificationSuccess = (verificationToken: string) => {
    // Store verification token
    localStorage.setItem('verificationToken', verificationToken)
    
    // Redirect to login page
    router.push("/auth/login")
    toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.")
  }

  return (
    <AuthLayout 
      title="Inscription"
      subtitle="Créez votre compte de guide"
    >
      {currentStep === 0 && (
        <GuideDocumentsStep
          onNext={onNext}
          onPrev={onPrev}
          email={formData.email}
          name={formData.name}
        />
      )}
      {currentStep === 1 && (
        <EmailVerificationStep
          email={formData.email}
          name={formData.name}
          onVerificationSuccess={handleVerificationSuccess}
          onPrev={onPrev}
        />
      )}
    </AuthLayout>
  )
}
