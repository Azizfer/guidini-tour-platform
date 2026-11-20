"use client"

import { useState } from "react"
import EnhancedAdminSideBar from "./admin-sidebar"
import EnhancedAdminMainContent from "./admin-main-content"

export default function AdminShell() {
  // Default to dashboard/overview
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [notifCounts, setNotifCounts] = useState<{ users: number; guides: number; reservations: number }>({ users: 0, guides: 0, reservations: 0 })

  const updateCount = (tab: "users" | "guides" | "reservations", count: number) => {
    setNotifCounts((prev) => ({ ...prev, [tab]: count }))
  }

  const clearCount = (tab: "users" | "guides" | "reservations") => {
    setNotifCounts((prev) => ({ ...prev, [tab]: 0 }))
    if (typeof window !== 'undefined') {
      localStorage.setItem(`admin_${tab}_lastVisited`, Date.now().toString())
    }
  }

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar (hidden on mobile via responsive classes in sidebar component) */}
      <EnhancedAdminSideBar activeTab={activeTab} setActiveTabAction={setActiveTab} notifCounts={notifCounts} clearCount={clearCount} />

      {/* Main area */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto">
          <EnhancedAdminMainContent activeTab={activeTab} setActiveTab={setActiveTab} updateCount={updateCount} />
        </div>
      </div>
    </div>
  )
}
