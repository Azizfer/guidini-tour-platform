'use client'

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatButton from '@/components/Chatbot';
import GuideProfileDashboard from './components/GuideProfileDashboard';
import { ThemeProvider } from 'next-themes';

export default function ProfileGuide() {
  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <GuideProfileDashboard /> 
        </main>
        <Footer />
        <ChatButton />
      </div>
    </ThemeProvider>
  );
}