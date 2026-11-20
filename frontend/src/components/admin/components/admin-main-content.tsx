"use client"

import type React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OverviewTab from "./overview-tab"
import ReservationsTab from "./reservations-tab"
import UsersTab from "./users-tab"
import GuidesTab from "./guides-tab"

interface EnhancedAdminMainContentProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  children?: React.ReactNode
  updateCount: (tab: "users" | "guides" | "reservations", count: number) => void
}

export default function EnhancedAdminMainContent({ activeTab, setActiveTab, children, updateCount }: EnhancedAdminMainContentProps) {
  const tabs = [
    { id: "overview", label: "Tableau de bord" },
    { id: "reservations", label: "Réservations" },
    { id: "users", label: "Utilisateurs" },
    { id: "guides", label: "Guides" },
    { id: "payments", label: "Paiements" },
    { id: "settings", label: "Paramètres" },
  ]

  return (
    <main className="flex-1 p-6 bg-gray-50/50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="hidden">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-all"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewTab setActiveTab={setActiveTab} />
        </TabsContent>

        <TabsContent value="reservations" className="space-y-6">
          <ReservationsTab onNewCount={(c) => updateCount('reservations', c)} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersTab onNewCount={(c) => updateCount('users', c)} />
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <GuidesTab onNewCount={(c) => updateCount('guides', c)} />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion des Paiements</h3>
            <p className="text-gray-600">Cette section sera bientôt disponible</p>
          </div>
        </TabsContent>
        {children}
      </Tabs>
    </main>
  )
}
