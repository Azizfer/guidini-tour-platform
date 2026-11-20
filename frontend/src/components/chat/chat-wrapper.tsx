"use client"

import React from "react"
import dynamic from "next/dynamic"
import { ChatProvider } from "@/contexts/chat-context"

// Import with consistent lowercase naming
const ChatInterface = dynamic(() => import("./Chat-Interface"), { ssr: false });

interface ChatWrapperProps {
  children: React.ReactNode
}

export default function ChatWrapper({ children }: ChatWrapperProps) {
  return (
    <ChatProvider>
      {children}
      <ChatInterface />
    </ChatProvider>
  )
}
