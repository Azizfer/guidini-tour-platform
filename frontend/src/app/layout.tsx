import '@/globals.css';
import React from 'react';
import { AuthProvider } from "./LogingContext/AuthContext"; //Make sure the whole app has access to the context
import ClientWrapper from '../components/ClientWrapper';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
          <ClientWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}