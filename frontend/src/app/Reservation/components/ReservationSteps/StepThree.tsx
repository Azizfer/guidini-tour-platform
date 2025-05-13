"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface StepThreeProps {
  activity: {
    title: string
    price: number
  }
  formData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    countryCode: string
  }
  date: Date | undefined
  participants: number
}

export default function StepThree({ activity, formData, date, participants }: StepThreeProps) {
  const totalPrice = activity.price * participants

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="font-medium mb-2">Récapitulatif de la réservation</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Activité:</span>
            <span>{activity.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span>{date ? format(date, "PPP", { locale: fr }) : "Non sélectionnée"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Participants:</span>
            <span>{participants}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Client:</span>
            <span>
              {formData.firstName} {formData.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Contact:</span>
            <span>{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Téléphone:</span>
            <span>
              {formData.countryCode}
              {formData.phoneNumber}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium">{totalPrice} DT</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
        <div className="flex items-start">
          <CreditCard className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
          <div>
            <h4 className="font-medium text-blue-700 mb-1">Paiement sécurisé via Konnekt</h4>
            <p className="text-sm text-blue-600">
              En cliquant sur "Réserver", vous serez redirigé vers la plateforme de paiement sécurisée Konnekt pour finaliser votre transaction.
            </p>
          </div>
        </div>
      </div>
      
      <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
        <h4 className="font-medium mb-2 text-gray-700">Modes de paiement acceptés</h4>
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1.5 bg-white rounded border border-gray-200 text-sm">Carte bancaire</div>
          <div className="px-3 py-1.5 bg-white rounded border border-gray-200 text-sm">e-DINAR</div>
          <div className="px-3 py-1.5 bg-white rounded border border-gray-200 text-sm">Portefeuille Konnekt</div>
        </div>
      </div>
    </div>
  )
}
