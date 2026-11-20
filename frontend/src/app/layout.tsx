import '@/globals.css';
import React from 'react';
import { AuthProvider } from "./LogingContext/AuthContext"; //Make sure the whole app has access to the context
import { MessageProvider } from "./Message/MessageContext"; // Import MessageProvider
import ClientWrapper from '../components/ClientWrapper';
import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/toaster";
import ChatWrapper from "@/components/chat/chat-wrapper";
import GlobalLogoutConfirmation from '@/components/LogoutConfirmation';
// IntegratedSlider component removed - file not found
import LoadingScreen from '@/components/loading-screen'; // Import LoadingScreen

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
            <MessageProvider>
              <ChatWrapper>
                {children}
                <ClientWrapper />
                <Toaster />
                <GlobalLogoutConfirmation />
                {/* IntegratedSlider component removed - file not found */}
              </ChatWrapper>
            </MessageProvider>
          </AuthProvider>
        </ThemeProvider>
        <LoadingScreen />
      </body>
    </html>
  );
}