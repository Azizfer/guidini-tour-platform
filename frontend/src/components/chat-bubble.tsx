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
  showAvatar?: boolean
  isSequential?: boolean
}

export default function ChatBubble({ message, senderInfo, showAvatar = true, isSequential = false }: ChatBubbleProps) {
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
        "flex w-full",
        isSequential ? "mb-0.5" : "mb-1.5",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for other users (only show for non-user messages) */}
      {!isUser && showAvatar && !isSequential && (
        <div className="mr-2 flex-shrink-0 self-end mb-1">
          <Avatar className="h-8 w-8 border border-gray-200">
            {senderInfo.avatar ? (
              <AvatarImage src={senderInfo.avatar} alt={senderInfo.name} />
            ) : (
              <AvatarFallback className="text-xs bg-gray-700 text-white">
                {senderInfo.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
            {senderInfo.online && (
              <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
            )}
          </Avatar>
        </div>
      )}
      
      {/* Spacer div when avatar is hidden for sequential messages */}
      {!isUser && (isSequential || !showAvatar) && (
        <div className="w-10 flex-shrink-0"></div>
      )}
      
      {/* User avatar - only shown if explicitly requested */}
      {isUser && showAvatar && !isSequential && (
        <div className="ml-2 flex-shrink-0 self-end mb-1 order-last">
          <Avatar className="h-8 w-8 border border-gray-200">
            {senderInfo.avatar ? (
              <AvatarImage src={senderInfo.avatar} alt={senderInfo.name} />
            ) : (
              <AvatarFallback className="text-xs bg-blue-600 text-white">
                {senderInfo.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
            {senderInfo.online && (
              <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
            )}
          </Avatar>
        </div>
      )}
      
      {/* Spacer div when user avatar is hidden for sequential messages */}
      {isUser && (isSequential || !showAvatar) && (
        <div className="w-10 flex-shrink-0 order-last"></div>
      )}
      
      {/* Message content */}
      <div className={cn(
        "flex flex-col", 
        isSequential ? "max-w-[75%]" : "max-w-[75%]",
        !isSequential && !isUser && "ml-0",
        !isSequential && isUser && "mr-0"
      )}>
        {!isSequential && !isUser && (
          <span className="text-xs text-gray-500 mb-1 ml-1">{senderInfo.name}</span>
        )}
        <div
          className={cn(
            "px-3 py-1.5",
            isUser
              ? "bg-teal-500 text-white" // Teal background for user messages (matching Chatbot)
              : "bg-gray-100 text-gray-800", // Light gray background for received messages (matching Chatbot)
            isSequential && isUser
              ? "rounded-xl rounded-tr-none"
              : isSequential && !isUser
              ? "rounded-xl rounded-tl-none"
              : isUser
              ? "rounded-xl rounded-tr-none"
              : "rounded-xl rounded-tl-none"
          )}
        >
          <p className="text-xs">{message.content}</p>
        </div>
        {/* Timestamp removed as requested */}
      </div>
    </motion.div>
  )
}
