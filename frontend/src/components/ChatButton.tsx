"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChatButton() {
  return (
    <Button
      className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg"
      onClick={() => {
        // TODO: Implement chat functionality
        console.log("Chat button clicked")
      }}
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  )
} 