"use client"

import  Destinations from "./components/Destinations"
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatButton from '@/components/ChatButton';
import { ThemeProvider } from 'next-themes';

export default function DestinationPage() {
    return (
      <ThemeProvider attribute="class">
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Destinations /> 
          </main>
          <Footer />
          <ChatButton />
        </div>
      </ThemeProvider>
    );
  }