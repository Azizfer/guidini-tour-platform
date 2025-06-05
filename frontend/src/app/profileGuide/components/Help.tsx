"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckIcon, QuestionMarkCircleIcon, EnvelopeIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline"

export default function Help() {
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [subject, setSubject] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isSubmitted, setIsSubmitted] = useState(false)

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
    <div className="relative overflow-hidden">
      <Card className="max-w-3xl mx-auto border border-gray-200 bg-white shadow-sm">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-100">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-4">
            <QuestionMarkCircleIcon className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Besoin d'aide ? Contactez-nous</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            Si vous avez besoin d'assistance ou souhaitez faire une déclaration, veuillez remplir le formulaire
            ci-dessous. Nous vous répondrons dans les plus brefs délais.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Votre nom (facultatif)
              </Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Entrez votre nom"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Votre email (facultatif)
              </Label>
              <div className="relative">
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Entrez votre email (si vous souhaitez une réponse)"
                />
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                Sujet
              </Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject" className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Sélectionnez un sujet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Problème de réservation">Problème de réservation</SelectItem>
                  <SelectItem value="Retour sur le tour">Retour sur le tour</SelectItem>
                  <SelectItem value="Problème avec la galerie">Problème avec la galerie</SelectItem>
                  <SelectItem value="Demande générale">Demande générale</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                Votre message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                placeholder="Veuillez décrire votre problème ou votre demande"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-md transition-all duration-300 shadow-sm hover:shadow-md"
              disabled={isSubmitted}
            >
              {isSubmitted ? (
                <div className="flex items-center">
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Message envoyé !
                </div>
              ) : (
                <div className="flex items-center">
                  <PaperAirplaneIcon className="mr-2 h-4 w-4" />
                  Envoyer le message
                </div>
              )}
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            Notre équipe examinera votre message et vous répondra dans les plus brefs délais. Merci de nous avoir
            contacté !
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
