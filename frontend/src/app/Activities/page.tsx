"use client"

import  Activities from "./components/ActivitiesDetails"
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatButton from '@/components/ChatButton';
import { ThemeProvider } from 'next-themes';

export default function ActvitiesPage() {
    return (
      <ThemeProvider attribute="class">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Activities /> 
          </main>
          <Footer />
          <ChatButton />
        </div>
      </ThemeProvider>
    );
  }