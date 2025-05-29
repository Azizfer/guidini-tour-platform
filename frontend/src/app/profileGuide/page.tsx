'use client'

import Header from '@/components/Header';
import Footer from '@/components/footer';
import ChatButton from '@/components/Chatbot';
import { ThemeProvider } from 'next-themes';
import ProfileDashboard from './components/profile-dashboard';

export default function ProfileGuide() {
  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <ProfileDashboard />
        </main>
        <Footer />
        <ChatButton />
      </div>
    </ThemeProvider>
  );
}