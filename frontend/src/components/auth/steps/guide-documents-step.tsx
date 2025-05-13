"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Upload, Check, AlertCircle } from "lucide-react"
import HandWrittenTitle from "@/components/ui/hand-written-title"

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
    <div className="flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6 w-full"
      >
        <HandWrittenTitle
          title="Documents requis"
          subtitle="Veuillez fournir les documents nécessaires"
          size="sm"
          className="mb-6"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-6 w-full"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-gray-800">Pièce d'identité</h2>
            <p className="text-sm text-gray-500">Carte d'identité ou passeport (obligatoire)</p>
          </div>

          <label
            htmlFor="id-card-upload"
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              idCard
                ? "border-teal-500 bg-teal-50"
                : idCardError
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-teal-300 hover:bg-gray-50"
            }`}
          >
            {idCard ? (
              <div className="flex flex-col items-center text-teal-600">
                <Check className="h-10 w-10 mb-2" />
                <p className="font-medium">{idCard.name}</p>
                <p className="text-xs text-teal-500 mt-1">{(idCard.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Upload className="h-10 w-10 mb-2" />
                <p className="font-medium">Cliquez pour télécharger</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG ou PNG (max 5MB)</p>
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
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{idCardError}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-medium text-gray-800">Certificat de guide (optionnel)</h2>
            <p className="text-sm text-gray-500">Si vous possédez une certification officielle</p>
          </div>

          <label
            htmlFor="certificate-upload"
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              certificate
                ? "border-teal-500 bg-teal-50"
                : certificateError
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:border-teal-300 hover:bg-gray-50"
            }`}
          >
            {certificate ? (
              <div className="flex flex-col items-center text-teal-600">
                <Check className="h-10 w-10 mb-2" />
                <p className="font-medium">{certificate.name}</p>
                <p className="text-xs text-teal-500 mt-1">{(certificate.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Upload className="h-10 w-10 mb-2" />
                <p className="font-medium">Cliquez pour télécharger</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG ou PNG (max 5MB)</p>
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
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{certificateError}</span>
            </div>
          )}
        </div>

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
