"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Upload, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
// Remove the crypto import since we'll use the Web Crypto API directly

interface GuideDocumentsStepProps {
  idCard: File | null
  setIdCard: React.Dispatch<React.SetStateAction<File | null>>
  certificate: File | null
  setCertificate: React.Dispatch<React.SetStateAction<File | null>>
  onNext: () => void
  onPrev: () => void
}

export default function GuideDocumentsStep({
  idCard,
  setIdCard,
  certificate,
  setCertificate,
  onNext,
  onPrev,
}: GuideDocumentsStepProps) {
  const [idCardError, setIdCardError] = useState("")
  const [certificateError, setCertificateError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleIdCardChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setIdCardError("Le fichier ne doit pas dépasser 5MB")
      return
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setIdCardError("Format de fichier non supporté. Les fichiers acceptés sont: JPG, JPEG, PNG, PDF.")
      return
    }

    setIdCardError("")
    setIdCard(file)
  }

  const handleCertificateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setCertificateError("Le fichier ne doit pas dépasser 5MB")
      return
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setCertificateError("Format de fichier non supporté. Les fichiers acceptés sont: JPG, JPEG, PNG, PDF.")
      return
    }

    setCertificateError("")
    setCertificate(file)
  }

  const handleNext = async () => {
    try {
      setIsLoading(true)
      
      // Clear any existing errors
      setIdCardError("")
      setCertificateError("")

      if (!idCard) {
        setIdCardError("Veuillez sélectionner une carte d'identité")
        return
      }

      // Generate a temporary user ID using Web Crypto API
      const tempUserId = window.crypto.randomUUID() || Date.now().toString()

      // Upload ID card first
      const formData = new FormData()
      formData.append('idCard', idCard)
      formData.append('userId', tempUserId)
      
      const idCardResponse = await fetch(`/api/users/signup/id-card`, {
        method: 'POST',
        body: formData
      })

      if (!idCardResponse.ok) {
        const errorData = await idCardResponse.json().catch(() => ({ error: 'An error occurred' }))
        throw new Error(`ID card upload failed: ${errorData.error || 'Unknown error'}`)
      }
      const idCardData = await idCardResponse.json()

      // Upload certificate if provided
      if (certificate) {
        const certFormData = new FormData()
        certFormData.append('certificate', certificate)
        certFormData.append('userId', tempUserId)
        
        const certResponse = await fetch(`/api/users/signup/certificate`, {
          method: 'POST',
          body: certFormData
        })

        if (!certResponse.ok) {
          const errorData = await certResponse.json().catch(() => ({ error: 'An error occurred' }))
          throw new Error(`Certificate upload failed: ${errorData.error || 'Unknown error'}`)
        }
      }

      toast({
        title: "Succès",
        description: "Documents téléchargés avec succès"
      })

      // Store the temp user ID in localStorage
      localStorage.setItem('tempUserId', tempUserId)
      
      // Proceed to the next step only once
      onNext()
    } catch (error) {
      console.error('Error uploading documents:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement des documents",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
            <div className="text-center mb-6">
              <p className="text-white text-2xl font-semibold mb-2 drop-shadow-lg">DOCUMENTS REQUIS</p>
              <p className="text-blue-100 text-base drop-shadow-md">Veuillez fournir les documents nécessaires</p>
            </div>

            {/* Form Content */}
            <div className="space-y-5 backdrop-blur-sm">
              <div className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-base font-medium text-white drop-shadow-md">Pièce d'identité</h2>
                  <p className="text-sm text-white/70 drop-shadow-sm">Carte d'identité ou passeport (obligatoire)</p>
                </div>

                <label
                  htmlFor="id-card-upload"
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                    idCard
                      ? "border-white bg-white/20"
                      : idCardError
                        ? "border-red-300 bg-red-500/20"
                        : "border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/15"
                  }`}
                >
                  {idCard ? (
                    <div className="flex flex-col items-center text-white">
                      <Check className="h-8 w-8 mb-2" />
                      <p className="font-medium text-sm">{idCard.name}</p>
                      <p className="text-xs text-white/70 mt-1">{(idCard.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-white/80">
                      <Upload className="h-8 w-8 mb-2" />
                      <p className="font-medium text-sm">Cliquez pour télécharger</p>
                      <p className="text-xs text-white/60 mt-1">PDF, JPG ou PNG (max 5MB)</p>
                    </div>
                  )}
                  <input
                    id="id-card-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleIdCardChange}
                  />
                </label>

                {idCardError && (
                  <div className="flex items-center gap-2 text-red-200 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{idCardError}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-base font-medium text-white drop-shadow-md">Certificat de guide (optionnel)</h2>
                  <p className="text-sm text-white/70 drop-shadow-sm">Si vous possédez une certification officielle</p>
                </div>

                <label
                  htmlFor="certificate-upload"
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                    certificate
                      ? "border-white bg-white/20"
                      : certificateError
                        ? "border-red-300 bg-red-500/20"
                        : "border-white/30 bg-white/10 hover:border-white/50 hover:bg-white/15"
                  }`}
                >
                  {certificate ? (
                    <div className="flex flex-col items-center text-white">
                      <Check className="h-8 w-8 mb-2" />
                      <p className="font-medium text-sm">{certificate.name}</p>
                      <p className="text-xs text-white/70 mt-1">{(certificate.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-white/80">
                      <Upload className="h-8 w-8 mb-2" />
                      <p className="font-medium text-sm">Cliquez pour télécharger</p>
                      <p className="text-xs text-white/60 mt-1">PDF, JPG ou PNG (max 5MB)</p>
                    </div>
                  )}
                  <input
                    id="certificate-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleCertificateChange}
                  />
                </label>

                {certificateError && (
                  <div className="flex items-center gap-2 text-red-200 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{certificateError}</span>
                  </div>
                )}
              </div>

              <div className="pt-3">
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-blue-600 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-base"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      En cours...
                    </>
                  ) : (
                    "Continuer"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
