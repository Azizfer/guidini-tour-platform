"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function ToursManagement() {
  const [tours, setTours] = useState([])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des visites</h2>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Ajouter une visite
        </Button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <p>Aucune visite disponible pour le moment.</p>
      </div>
    </div>
  )
}
