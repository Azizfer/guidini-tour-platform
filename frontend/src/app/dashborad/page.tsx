"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/LogingContext/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-64px)]">Chargement...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6 pt-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>
      <p className="text-gray-600 dark:text-gray-400">Bienvenue sur votre tableau de bord Guidini</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Gérez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Complétez votre profil pour améliorer votre expérience.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Réservations</CardTitle>
            <CardDescription>Consultez vos réservations actuelles</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Vous n'avez pas de réservations en cours.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>Vos conversations récentes</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Aucun message récent.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
