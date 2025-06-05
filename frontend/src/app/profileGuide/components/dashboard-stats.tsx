"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"
import { useState, useEffect } from "react"

import {
  CalendarIcon,
  UsersIcon,
  StarIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline"

// Ajouter la fonctionnalité de dialogue pour "Voir toutes les activités"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import notificationService from "@/services/notificationService"
import { useGuideStats } from "@/services/guideStatsService"

// Legacy interface kept for backward compatibility
interface Guide {
  toursCount?: number
  completedToursCount?: number
  privateToursCount?: number
  reservationsCount?: number
  rating?: number
  reviewCount?: number
  totalRevenue?: number
  touristsCount?: number
  paymentsReceived?: number
}

interface ProfileStatsProps {
  guide: Guide
}

export function DashboardStats({ guide }: ProfileStatsProps) {
  // Récupérer l'ID du guide depuis le localStorage ou les props
  const guideId = typeof localStorage !== "undefined" ? localStorage.getItem("userId") || "" : ""

  // Utiliser le hook useGuideStats pour récupérer les statistiques du guide
  const { stats: guideStats, loading, error, refreshStats } = useGuideStats(guideId)

  // Convertir les statistiques du guide pour la compatibilité avec l'interface existante
  const stats = {
    toursCount: guideStats.activeTours || 0,
    completedToursCount: guideStats.completedTours || 0,
    privateToursCount: guideStats.privateTours || 0,
    reservationsCount: guideStats.reservations || 0,
    rating: guideStats.rating || 0,
    reviewCount: guideStats.reviewCount || 0,
    totalRevenue: guideStats.totalRevenue || 0,
    touristsCount: guideStats.touristsCount || 0,
    paymentsReceived: guideStats.paymentsReceived || 0,
  }

  // State for recent activity data
  const [recentActivity, setRecentActivity] = useState<
    Array<{
      title: string
      description: string
      amount: string
      date: string
      icon: React.ReactNode
      isIncome: boolean
      tourId?: string
      guideId?: string
    }>
  >([])

  // Rafraîchir les statistiques périodiquement
  useEffect(() => {
    // Rafraîchir les stats toutes les 30 secondes
    const intervalId = setInterval(() => {
      refreshStats()
    }, 30000)

    return () => clearInterval(intervalId)
  }, [refreshStats])

  // Listen for dashboard refresh events
  useEffect(() => {
    const handleRefreshDashboard = () => {
      console.log("Dashboard refresh event received, updating stats...")
      refreshStats()
    }

    // Add event listener
    window.addEventListener("refreshDashboard", handleRefreshDashboard)

    // Clean up
    return () => {
      window.removeEventListener("refreshDashboard", handleRefreshDashboard)
    }
  }, [refreshStats])

  // Fetch notifications when component mounts
  useEffect(() => {
    // Rafraîchir les statistiques au montage du composant
    refreshStats()

    const fetchNotifications = async () => {
      try {
        const notifications = await notificationService.getUserNotifications()
        const currentGuideId = guideId // This is the ID of the current guide viewing the dashboard

        // Filter and transform notifications into activity items
        const activityItems = notifications
          .filter((notification) => {
            // For payment notifications, only show them if this guide is the creator/recipient of the tour
            if (notification.type === "payment") {
              // Check if this notification is intended for this guide (they created the tour)
              return notification.guideId === currentGuideId
            }

            // For other notification types, show them all
            return (
              notification.type === "booking" ||
              notification.type === "review" ||
              notification.type === "booking_confirmation" ||
              notification.type === "booking_cancellation" ||
              notification.type === "system"
            )
          })
          .map((notification) => {
            let icon
            let isIncome = false
            let amount = ""

            switch (notification.type) {
              case "payment":
                icon = <CurrencyDollarIcon className="h-5 w-5 text-emerald-500" />
                isIncome = true
                amount = notification.amount ? `+${notification.amount.toFixed(2)}` : ""
                // Override title for payment notifications in guide dashboard
                notification.title = "Paiement reçu"
                break
              case "booking":
              case "booking_confirmation":
                icon = <CalendarIcon className="h-5 w-5 text-blue-500" />
                isIncome = false
                break
              case "booking_cancellation":
                icon = <EyeSlashIcon className="h-5 w-5 text-red-500" />
                isIncome = false
                break
              case "review":
                icon = <StarIcon className="h-5 w-5 text-amber-500" />
                isIncome = false
                break
              case "system":
                icon = <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                isIncome = false
                break
              default:
                icon = <ClockIcon className="h-5 w-5 text-gray-500" />
            }

            return {
              title: notification.title,
              description: notification.description,
              amount,
              date: notification.time,
              icon,
              isIncome,
              tourId: notification.tourId,
              guideId: notification.guideId,
            }
          })

        // If no notifications, add a default message
        if (activityItems.length === 0) {
          activityItems.push({
            title: "Aucune activité récente",
            description: "Vous n'avez pas encore d'activité récente",
            amount: "",
            date: "Aujourd'hui",
            icon: <UsersIcon className="h-5 w-5 text-gray-500" />,
            isIncome: false,
            tourId: undefined,
            guideId: undefined,
          })
        }

        setRecentActivity(activityItems)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        // Set default activity if there's an error
        setRecentActivity([
          {
            title: "Erreur de chargement",
            description: "Impossible de charger les activités récentes",
            amount: "",
            date: "Aujourd'hui",
            icon: <UsersIcon className="h-5 w-5 text-gray-500" />,
            isIncome: false,
            tourId: undefined,
            guideId: undefined,
          },
        ])
      }
    }

    fetchNotifications()
  }, [])

  // Ajouter un état pour contrôler l'ouverture du dialogue
  const [showAllActivities, setShowAllActivities] = useState(false)

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Stats Cards - Redesigned with modern style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tours Actifs"
          value={stats.toursCount.toString()}
          icon={<CalendarIcon className="h-5 w-5" />}
          change="Visibles aux touristes"
          color="text-blue-600"
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
        />
        <StatCard
          title="Tours Privés"
          value={stats.privateToursCount.toString()}
          icon={<EyeSlashIcon className="h-5 w-5" />}
          change="Non visibles"
          color="text-gray-600"
          bgColor="bg-gray-50"
          borderColor="border-gray-200"
        />
        <StatCard
          title="Tours Complétés"
          value={stats.completedToursCount.toString()}
          icon={<CheckCircleIcon className="h-5 w-5" />}
          change="Peuvent être notés"
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          borderColor="border-emerald-200"
        />
        <StatCard
          title="Réservations"
          value={stats.reservationsCount.toString()}
          icon={<UsersIcon className="h-5 w-5" />}
          change="Total"
          color="text-purple-600"
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
        />
      </div>

      {/* Revenue Card and Notifications Card side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card - Redesigned with modern style */}
        <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4 border-b border-gray-100">
            <CardTitle className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
              Revenus
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <div className="flex items-center">
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalRevenue ? `${stats.totalRevenue.toLocaleString()} TND` : "0 TND"}
                </p>
                <div className="ml-3 px-2 py-1 bg-emerald-50 rounded-full flex items-center">
                  <ArrowUpIcon className="h-3 w-3 text-emerald-500 mr-1" />
                  <span className="text-xs text-emerald-600">+10% vs. mois dernier</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-6">
              {/* Replaced Touristes with Paiements reçus */}
              <div className="flex flex-col">
                <p className="text-sm text-gray-500 mb-1">Paiements reçus</p>
                <div className="flex items-center">
                  <p className="text-xl font-semibold text-gray-800">{stats.paymentsReceived || 0}</p>
                  {stats.paymentsReceived > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-emerald-50 rounded text-xs text-emerald-600">+15%</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col">
                <p className="text-sm text-gray-500 mb-1">Revenu moyen / tour</p>
                <p className="text-xl font-semibold text-gray-800">
                  {stats.toursCount > 0 && stats.totalRevenue > 0
                    ? `${Math.round(stats.totalRevenue / stats.toursCount).toLocaleString()} TND`
                    : "0 TND"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card - Redesigned with modern style */}
        <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4 border-b border-gray-100">
            <CardTitle className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-blue-600" />
              Activités Récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100">{activity.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-xs text-gray-500">{activity.date}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-600">{activity.description}</div>
                    {activity.amount && (
                      <div
                        className={`text-sm font-semibold ${activity.isIncome ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {activity.amount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
              <Button
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
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
            <DialogDescription className="text-gray-500">
              Historique complet de vos activités récentes
            </DialogDescription>
          </DialogHeader>
          <div className="divide-y divide-gray-100 mt-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gray-100">{activity.icon}</div>
                  <div>
                    <div className="font-medium text-gray-900">{activity.title}</div>
                    <div className="text-xs text-gray-500">{activity.date}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-gray-600">{activity.description}</div>
                  {activity.amount && (
                    <div className={`text-sm font-semibold ${activity.isIncome ? "text-emerald-600" : "text-red-600"}`}>
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
  borderColor: string
}

function StatCard({ title, value, icon, change, color, bgColor, borderColor }: StatCardProps) {
  return (
    <Card className={`border ${borderColor} bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow`}>
      <CardHeader
        className={`${bgColor} pb-3 border-b ${borderColor} flex flex-row items-center justify-between space-y-0`}
      >
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <div className={`p-2 rounded-full bg-white/80 ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{change}</p>
      </CardContent>
    </Card>
  )
}

function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`px-4 py-2 rounded-md text-sm transition-colors ${className}`} {...props}>
      {children}
    </button>
  )
}
