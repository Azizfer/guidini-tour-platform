"use client"

import { Button } from "@/components/ui/button"

interface ConfirmationDialogProps {
  onConfirm: (confirm: boolean) => void
}

export default function ConfirmationDialog({ onConfirm }: ConfirmationDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => onConfirm(false)}>
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">Quitter le processus de réservation ?</h3>
        <p className="text-gray-600 mb-4">
          Êtes-vous sûr de vouloir quitter ? Vos informations de réservation seront perdues.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onConfirm(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(true)}>
            Quitter
          </Button>
        </div>
      </div>
    </div>
  )
}
