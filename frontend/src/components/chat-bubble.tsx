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
  const isUser = message.sender === "user";
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
        "flex w-full gap-2 mb-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={senderInfo.avatar} alt={senderInfo.name} />
          <AvatarFallback className={isUser ? "bg-blue-500" : "bg-teal-500 text-white"}>
            {senderInfo.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {senderInfo.online && (
          <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
        )}
      </div>

      {/* Message content */}
      <div className="flex flex-col max-w-[80%]">
        <div
          className={cn(
            "px-3 py-2 rounded-lg",
            isUser
              ? "bg-blue-500 text-white rounded-tr-none"
              : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-tl-none"
          )}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <span
          className={cn(
            "text-xs mt-1 text-gray-500 dark:text-gray-400",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formattedTime}
        </span>
      </div>
    </motion.div>
  )
}
