import type React from "react"
import Header from "@/components/Header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="pt-16 container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
