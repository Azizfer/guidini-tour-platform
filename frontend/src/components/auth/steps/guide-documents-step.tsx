"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Upload, Check, AlertCircle } from "lucide-react"

interface GuideDocumentsStepProps {
  idCard: File | null
  setIdCard: (file: File | null) => void
  certificate: File | null
  setCertificate: (file: File | null) => void
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

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setIdCardError("Le fichier ne doit pas dépasser 5MB")
      return
    }

    setIdCardError("")
    setIdCard(file)
  }

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setCertificateError("Le fichier ne doit pas dépasser 5MB")
      return
    }

    setCertificateError("")
    setCertificate(file)
  }

  const handleNext = () => {
    if (!idCard) {
      setIdCardError("Veuillez télécharger votre pièce d'identité")
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
