"use client"

import AllActivities from "./components/AllActivities"
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from 'next-themes';

export default function ActvitiesPage() {
    return (
      <ThemeProvider attribute="class">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <AllActivities />
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    );
  }