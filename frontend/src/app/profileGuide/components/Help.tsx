"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, HelpCircle, Mail, Send } from "lucide-react"

export default function Help() {
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [subject, setSubject] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Ici, vous pouvez envoyer les données à votre backend (par exemple, via une requête API)
    console.log("Formulaire de contact soumis :", { name, email, subject, message })

    // Animation de succès
    setIsSubmitted(true)

    // Réinitialiser le formulaire après la soumission
    setTimeout(() => {
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
      setIsSubmitted(false)
    }, 3000)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-teal-50 to-blue-50 opacity-70"></div>

      <Card className="relative z-10 max-w-3xl mx-auto border border-white/20 bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader className="text-center">
          <motion.div variants={itemVariants}>
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center mb-4">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              Besoin d'aide ? Contactez-nous
            </CardTitle>
          </motion.div>
          <motion.p variants={itemVariants} className="text-center text-gray-600 mt-2">
            Si vous avez besoin d'assistance ou souhaitez faire une déclaration, veuillez remplir le formulaire
            ci-dessous. Nous vous répondrons dans les plus brefs délais.
          </motion.p>
        </CardHeader>

        <CardContent>
          <motion.form variants={containerVariants} onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={itemVariants}>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Votre nom (facultatif)
              </Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 bg-white/50 border-white/20 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                placeholder="Entrez votre nom"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Votre email (facultatif)
              </Label>
              <div className="relative">
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 pl-10 bg-white/50 border-white/20 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                  placeholder="Entrez votre email (si vous souhaitez une réponse)"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                Sujet
              </Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject" className="bg-white/50 border-white/20">
                  <SelectValue placeholder="Sélectionnez un sujet" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-sm border-white/20">
                  <SelectItem value="Problème de réservation">Problème de réservation</SelectItem>
                  <SelectItem value="Retour sur le tour">Retour sur le tour</SelectItem>
                  <SelectItem value="Problème avec la galerie">Problème avec la galerie</SelectItem>
                  <SelectItem value="Demande générale">Demande générale</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                Votre message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 bg-white/50 border-white/20 focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                rows={4}
                placeholder="Veuillez décrire votre problème ou votre demande"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={isSubmitted}
              >
                {isSubmitted ? (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Message envoyé !
                  </motion.div>
                ) : (
                  <motion.div className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer le message
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.p variants={itemVariants} className="mt-6 text-sm text-center text-gray-500">
            Notre équipe examinera votre message et vous répondra dans les plus brefs délais. Merci de nous avoir
            contacté !
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
