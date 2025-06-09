"use client"

import { useAuth } from "@/app/LogingContext/AuthContext"
import CompletedTours from "../components/completed-tours"

export default function CompletedToursPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto py-8 px-4">
      <CompletedTours />
    </div>
  )
}
