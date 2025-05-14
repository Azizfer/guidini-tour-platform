"use client"

import AllGuides from '@/app/guides/components/AllGuides'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ThemeProvider } from 'next-themes'

export default function AllGuidesPage() {
  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <AllGuides />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}