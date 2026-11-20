"use client"

import { LayoutDashboard, CalendarDays, Users, ShieldCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"

interface NotificationCounts {
  users: number
  guides: number
  reservations: number
}

interface EnhancedAdminSideBarProps {
  activeTab: string
  setActiveTabAction: (tab: string) => void
  notifCounts: NotificationCounts
  clearCount: (tab: "users" | "guides" | "reservations") => void
}

// Guidini Logo Component
function GuidiniLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg width="24" height="24" viewBox="0 0 1000 1000" className="mr-2">
        <path
          fill="#2E668F"
          d="M273.1,457.6h-30c-1.1-1.3-2.3-2.9-3.4-4.6c-13.7-21.4-41-30.6-66.6-23.7c-70.5,22.2-53.7,124.6,19.6,127.5 c3.2,0.4,8-0.3,9.2,3.7c0.6,2.4-0.7,4-2.6,5c-10.7,5.3-21.9,9.5-33.4,12.7c-2.8,0.8-5.5-0.8-8-1.9c-37.7-15.4-62.1-56.4-56.8-95.3 c9.3-90.8,133-112.6,170.4-27.1C272.2,455.3,272.7,456.5,273.1,457.6z"
        />
        <path
          fill="#1B263B"
          d="M217.2,482.2c0.2,4.1-0.5,8.1-2,11.9c-6,15-15.1,28.1-24.3,41.2c-2.6,3.7-4.9,3.8-7.5-0.1 c-9-13.2-18.1-26.4-23.8-41.5c-6.2-16.4,1.6-34.3,16.7-39.8c16.4-6,33.7,2.2,39.5,18.5C216.8,475.7,217.2,478.9,217.2,482.2z M187.3,464c-10.1-0.1-18.5,8-18.8,18c-0.4,10.5,8.4,19.7,18.9,19.8c9.8,0,18.2-8.5,18.3-18.6C205.8,472.6,197.7,464.1,187.3,464z"
        />
      </svg>
      <span className="font-bold text-gray-800 text-lg">GUIDINI</span>
    </div>
  )
}

import { useLogoutConfirmation } from "@/components/LogoutConfirmation"

export default function EnhancedAdminSideBar({ activeTab, setActiveTabAction, notifCounts, clearCount }: EnhancedAdminSideBarProps) {
  const [adminData, setAdminData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  // hook to trigger global logout confirmation dialog
  const { open: openLogoutConfirmation } = useLogoutConfirmation()

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setAdminData({
          name: "Admin Guidini",
          email: "admin@guidini.com",
          avatar: "/placeholder.svg?height=40&width=40&text=AG",
        })
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const menuItems = [
    {
      id: "overview",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "reservations",
      label: "Réservations",
      icon: CalendarDays,
      badge: notifCounts.reservations ? `${notifCounts.reservations}` : null,
    },
    {
      id: "users",
      label: "Utilisateurs",
      icon: Users,
      badge: notifCounts.users ? `${notifCounts.users}` : null,
    },
    {
      id: "guides",
      label: "Guides",
      icon: ShieldCheck,
      badge: notifCounts.guides ? `${notifCounts.guides}` : null,
    },
    // Paramètres menu removed per user request
  ]

  const handleTabChange = (tab: string) => {
    setActiveTabAction(tab)
    if (tab === 'users' || tab === 'guides' || tab === 'reservations') {
      clearCount(tab)
    }
  }

  const handleLogout = () => {
    // Open the global logout confirmation dialog
    openLogoutConfirmation(() => {
      // Callback executed after user confirms logout in dialog
      window.location.href = "/"
    })
  }

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 px-6 py-4">
        <GuidiniLogo />
      </SidebarHeader>

      <SidebarContent className="px-3 py-8">
        <SidebarMenu className="mt-4 space-y-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                active={activeTab === item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">{item.badge}</Badge>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Déconnexion</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={adminData?.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                {adminData?.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-900 truncate">{adminData?.name || "Administrateur"}</span>
              <span className="text-xs text-gray-500 truncate">{adminData?.email || "admin@guidini.com"}</span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
