"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"
import { useState } from "react"

import {
  CalendarIcon,
  UsersIcon,
  StarIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"

// Ajouter la fonctionnalité de dialogue pour "Voir toutes les activités"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Guide {
  toursCount: number
  reservationsCount: number
  rating: number
  reviewCount: number
  totalRevenue: number
  touristsCount: number
  paymentsReceived: number
}

interface ProfileStatsProps {
  guide: Guide
}

export function DashboardStats({ guide }: ProfileStatsProps) {
  // Recent activity data
  const recentActivity = [
    {
      title: "Réservation confirmée",
      description: "Tour de la Médina de Sousse",
      amount: "+120.00",
      date: "Aujourd'hui, 14:45",
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      isIncome: true,
    },
    {
      title: "Paiement reçu",
      description: "Tour du Ribat de Monastir",
      amount: "+180.00",
      date: "Aujourd'hui, 10:30",
      icon: <CurrencyDollarIcon className="h-5 w-5 text-green-500" />,
      isIncome: true,
    },
    {
      title: "Nouvelle évaluation",
      description: "5 étoiles - Tour de la plage",
      amount: "",
      date: "Hier, 18:20",
      icon: <StarIcon className="h-5 w-5 text-yellow-500" />,
      isIncome: false,
    },
    {
      title: "Nouvelle réservation",
      description: "Tour gastronomique",
      amount: "+65.00",
      date: "Hier, 12:00",
      icon: <ClockIcon className="h-5 w-5 text-blue-500" />,
      isIncome: true,
    },
    {
      title: "Nouveau message",
      description: "De: Sarah (cliente)",
      amount: "",
      date: "22 Juin, 09:15",
      icon: <UsersIcon className="h-5 w-5 text-blue-500" />,
      isIncome: false,
    },
  ]

  // Ajouter un état pour contrôler l'ouverture du dialogue
  const [showAllActivities, setShowAllActivities] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tours Actifs"
          value={guide.toursCount.toString()}
          icon={<CalendarIcon className="h-5 w-5" />}
          change="+2 ce mois"
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Réservations"
          value={guide.reservationsCount.toString()}
          icon={<UsersIcon className="h-5 w-5" />}
          change="+3 cette semaine"
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Évaluation"
          value={guide.rating.toString()}
          icon={<StarIcon className="h-5 w-5" />}
          change={`${guide.reviewCount} avis`}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          title="Touristes Guidés"
          value={guide.touristsCount.toString()}
          icon={<UsersIcon className="h-5 w-5" />}
          change="+12 ce mois"
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Section */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-slate-900">Revenus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total des revenus</p>
                <p className="text-3xl font-bold text-slate-900">{guide.totalRevenue} TND</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-sm text-slate-500">Paiements reçus</p>
                <div className="flex items-center gap-1">
                  <p className="text-xl font-semibold text-slate-900">{guide.paymentsReceived}</p>
                  <span className="text-xs flex items-center text-green-600">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    +15%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">Revenu moyen / tour</p>
                <p className="text-xl font-semibold text-slate-900">
                  {Math.round(guide.totalRevenue / guide.toursCount)} TND
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Section */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-slate-900">Activités Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.slice(0, 4).map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-slate-100">{activity.icon}</div>
                    <div>
                      <div className="font-medium text-slate-900">{activity.title}</div>
                      <div className="text-xs text-slate-500">{activity.date}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-slate-600">{activity.description}</div>
                    {activity.amount && (
                      <div className={`text-sm font-semibold ${activity.isIncome ? "text-green-600" : "text-red-600"}`}>
                        {activity.amount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Modifier le bouton "Voir toutes les activités" pour ouvrir le dialogue */}
            <div className="mt-4 pt-4 border-t border-slate-200 text-center">
              <Button
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                onClick={() => setShowAllActivities(true)}
              >
                Voir toutes les activités
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Ajouter le dialogue après la section des cartes */}
      <Dialog open={showAllActivities} onOpenChange={setShowAllActivities}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Toutes les activités récentes</DialogTitle>
            <DialogDescription className="text-slate-500">
              Historique complet de vos activités récentes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-slate-100">{activity.icon}</div>
                  <div>
                    <div className="font-medium text-slate-900">{activity.title}</div>
                    <div className="text-xs text-slate-500">{activity.date}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-slate-600">{activity.description}</div>
                  {activity.amount && (
                    <div className={`text-sm font-semibold ${activity.isIncome ? "text-green-600" : "text-red-600"}`}>
                      {activity.amount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  change: string
  color: string
  bgColor: string
}

function StatCard({ title, value, icon, change, color, bgColor }: StatCardProps) {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <div className={color}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{change}</p>
      </CardContent>
    </Card>
  )
}

function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
