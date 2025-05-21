import '@/globals.css';
import React from 'react';
import { AuthProvider } from "./LogingContext/AuthContext"; //Make sure the whole app has access to the context
import ClientWrapper from '../components/ClientWrapper';
import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/toaster";


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
            {children}
            <ClientWrapper />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}