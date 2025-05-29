"use client"

import ActivitiesList from './ActivitiesList'
import Header from '@/components/Header'
import Footer from '@/components/footer'
import ChatButton from '@/components/ChatButton'
import { ThemeProvider } from 'next-themes'

export default function DestinationActivitiesPage() {
  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <ActivitiesList />
        </main>
        <Footer />
        <ChatButton />
      </div>
    </ThemeProvider>
  )
}
