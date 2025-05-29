import '@/globals.css';
import React from 'react';
import { AuthProvider } from "./LogingContext/AuthContext"; //Make sure the whole app has access to the context
import ClientWrapper from '../components/ClientWrapper';
import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/toaster";
import ChatWrapper from "@/components/chat-wrapper";
// IntegratedSlider component removed - file not found

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <ChatWrapper>
              {children}
              <ClientWrapper />
              <Toaster />
              {/* IntegratedSlider component removed - file not found */}
            </ChatWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}