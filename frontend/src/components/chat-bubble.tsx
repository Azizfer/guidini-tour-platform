"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatBubbleProps {
  message: {
    id: string
    content: string
    sender: "user" | "other"
    timestamp: Date
  }
  senderInfo: {
    name: string
    avatar?: string
    online?: boolean
  }
}

export default function ChatBubble({ message, senderInfo }: ChatBubbleProps) {
  // Ensure messages from the current user are always displayed on the right side
  const isUser = message.sender === "user";
  
  // Format the timestamp
  const formattedTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(message.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex w-full mb-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Message content */}
      <div className="flex flex-col max-w-[75%]">
        <div
          className={cn(
            "px-3 py-2 rounded-2xl",
            isUser
              ? "bg-purple-600 text-white rounded-br-none" // Purple background for user messages
              : "bg-gray-800 text-white rounded-bl-none" // Dark gray background for received messages
          )}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <span
          className={cn(
            "text-xs mt-1 text-gray-500",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formattedTime}
        </span>
      </div>
    </motion.div>
  )
}
