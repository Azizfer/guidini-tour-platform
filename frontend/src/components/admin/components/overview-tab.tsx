"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  ShieldCheck,
  CalendarDays,
  CreditCard,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import type { LucideProps } from "lucide-react"
import type { ComponentType } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { differenceInHours, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface OverviewTabProps {
  setActiveTab: (tab: string) => void
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export default function OverviewTab({ setActiveTab }: OverviewTabProps) {
  type StatItem = {
    title: string
    value: string
    change: string
    trend: 'up' | 'down'
    icon: ComponentType<LucideProps>
    color: string
  }

  type ActivityItem = {
    user: string
    action: string
    time: string
    status: 'success' | 'warning' | 'error'
  }

  const [stats, setStats] = useState<StatItem[]>([])
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])
  const [showAll, setShowAll] = useState(false)
  const [pendingGuides, setPendingGuides] = useState<any[]>([])
  const [loadingPending, setLoadingPending] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        console.log('Fetching dashboard stats...')
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Received dashboard stats:', data)

        const formattedStats: StatItem[] = [
          {
            title: "Utilisateurs Total",
            value: data.stats?.usersTotal?.toLocaleString('fr-FR') || "N/A",
            change: "",
            trend: "up" as const,
            icon: Users,
            color: "blue",
          },
          {
            title: "Guides Actifs",
            value: data.stats.guidesActive.toLocaleString('fr-FR'),
            change: "",
            trend: "up" as const,
            icon: ShieldCheck,
            color: "green",
          },
          {
            title: "Réservations",
            value: data.stats.reservations.toLocaleString('fr-FR'),
            change: "",
            trend: "up" as const,
            icon: CalendarDays,
            color: "purple",
          },
          {
            title: "Revenus",
            value: new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'TND'
            }).format(data.stats?.revenue || 0),
            change: "",
            trend: "down" as const,
            icon: CreditCard,
            color: "orange",
          },
        ]

        setStats(formattedStats)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        // Set default values if fetch fails
        setStats([
          {
            title: "Utilisateurs Total",
            value: "N/A",
            change: "",
            trend: "down" as const,
            icon: Users,
            color: "gray",
          },
          {
            title: "Guides Actifs",
            value: "N/A",
            change: "",
            trend: "up" as const,
            icon: ShieldCheck,
            color: "green",
          },
          {
            title: "Réservations",
            value: "N/A",
            change: "",
            trend: "up",
            icon: CalendarDays,
            color: "purple",
          },
          {
            title: "Revenus",
            value: "N/A",
            change: "",
            trend: "down" as const,
            icon: CreditCard,
            color: "orange",
          },
        ])
      }
    }

    fetchDashboardStats()
  }, [])

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/dashboard/activities')
        if (!res.ok) throw new Error(`HTTP error ${res.status}`)
        const data = await res.json()
        setRecentActivities(data.activities || [])
      } catch (err) {
        console.error('Error fetching activities:', err)
      }
    }
    fetchActivities()
  }, [])

  useEffect(() => {
    const fetchPendingGuides = async () => {
      try {
        setLoadingPending(true)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const res = await fetch(`${BACKEND_URL}/api/admin/guides?status=pending`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setPendingGuides(Array.isArray(data) ? data : data.guides || [])
      } catch (err) {
        console.error('Error fetching pending guides:', err)
        setPendingGuides([])
      } finally {
        setLoadingPending(false)
      }
    }
    fetchPendingGuides()
  }, [])

  const pendingActions = pendingGuides.map((g) => ({
    id: g._id,
    title: 'Nouvelle demande de guide',
    description: `${g.name || g.username || 'Guide'} a soumis sa candidature`,
    time: formatDistanceToNow(new Date(g.createdAt || g.updatedAt || Date.now()), { locale: fr, addSuffix: true }),
    action: 'Examiner',
  }))

  if (!stats.length) {
    return <div className="flex items-center justify-center h-32">Chargement des statistiques...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-full ${
                    stat.color === "blue"
                      ? "bg-blue-100"
                      : stat.color === "green"
                        ? "bg-green-100"
                        : stat.color === "purple"
                          ? "bg-purple-100"
                          : "bg-orange-100"
                  }`}
                >
                  {(() => {
                    const Icon = stat.icon
                    return (
                      <Icon
                        className={`h-6 w-6 ${
                          stat.color === "blue"
                            ? "text-blue-600"
                            : stat.color === "green"
                              ? "text-green-600"
                              : stat.color === "purple"
                                ? "text-purple-600"
                                : "text-orange-600"
                        }`}
                      />
                    )
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Actions en attente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingActions.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setActiveTab('guides')}
                >
                  {item.action}
                </Button>
              </div>
            ))}
            {!pendingActions.length && !loadingPending && (
              <p className="text-sm text-gray-500">Aucune action en attente</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Activités récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.slice(0,4).map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div
                  className={`p-1 rounded-full ${
                    activity.status === "success"
                      ? "bg-green-100"
                      : activity.status === "warning"
                        ? "bg-yellow-100"
                        : "bg-red-100"
                  }`}
                >
                  {activity.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : activity.status === "warning" ? (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
            {recentActivities.length > 4 && (
              <Dialog open={showAll} onOpenChange={setShowAll}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAll(true)}>
                    Voir toutes les Activités
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Activités récentes</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div
                          className={`p-1 rounded-full ${
                            activity.status === "success"
                              ? "bg-green-100"
                              : activity.status === "warning"
                                ? "bg-yellow-100"
                                : "bg-red-100"
                          }`}
                        >
                          {activity.status === "success" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : activity.status === "warning" ? (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
