"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X } from "lucide-react"

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
  showTimestamp?: boolean
  onClose?: () => void
}

export default function ChatBubble({
  message,
  senderInfo,
  isSequential = false,
  showAvatar = true,
  showTimestamp = false,
  onClose,
}: ChatBubbleProps) {
  // Determine if the message is from the current user
  const isUser = message.sender === "user";
  
  // Format the timestamp - not used in individual bubbles anymore
  const formattedTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(message.timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "flex w-full",
        isSequential ? "mb-0.5" : "mb-1",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Other user's avatar - only shown for received messages */}
      {!isUser && showAvatar && !isSequential && (
        <div className="mr-1.5 flex-shrink-0">
          <div className="relative">
            <Avatar className="h-6 w-6 border border-white shadow-sm">
              {senderInfo.avatar ? (
                <AvatarImage src={senderInfo.avatar} alt={senderInfo.name} />
              ) : (
                <AvatarFallback className="text-[9px] bg-amber-500 text-white">
                  {senderInfo.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            {senderInfo.online && (
              <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-green-500 border border-white"></span>
            )}
          </div>
        </div>
      )}
      
      {/* Spacer for sequential messages */}
      {!isUser && (isSequential || !showAvatar) && (
        <div className="w-6 ml-1.5 flex-shrink-0"></div>
      )}
      
      {/* Message content container */}
      <div className={cn(
        "flex flex-col", 
        isUser ? "max-w-[90%] mr-1" : "max-w-[85%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Sender name - only for first message in a sequence */}
        {!isSequential && !isUser && (
          <span className="text-[9px] text-gray-500 mb-0.5 ml-1 font-medium">{senderInfo.name}</span>
        )}
        
        {/* Actual message bubble */}
        <div
          className={cn(
            "px-2.5 py-1.5 shadow-sm relative group",
            isUser
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
              : "bg-gray-100 text-gray-800",
            "rounded-2xl"
          )}
        >
          {/* Close button for the bubble */}
          {onClose && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              className="absolute -top-1 -right-1 bg-white rounded-full w-[18px] h-[18px] flex items-center justify-center shadow-md z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-50 border border-gray-200"
            >
              <X className="h-2.5 w-2.5 text-gray-600" />
            </button>
          )}
          <p className={cn("text-xs leading-normal", !isUser && "font-normal")}>{message.content}</p>
        </div>
        
        {/* Timestamp is only shown when explicitly requested by parent component */}
        {showTimestamp && (
          <div className="w-full flex justify-center my-2">
            <div className="bg-gray-100 text-gray-500 text-[10px] px-3 py-1 rounded-full font-medium">
              {formattedTime}
            </div>
          </div>
        )}
      </div>
      
      {/* User avatar - at the end for user messages */}
      {isUser && showAvatar && !isSequential && (
        <div className="ml-2 flex-shrink-0">
          <div className="relative">
            <Avatar className="h-7 w-7 border border-white shadow-sm">
              {senderInfo.avatar ? (
                <AvatarImage src={senderInfo.avatar} alt={senderInfo.name} />
              ) : (
                <AvatarFallback className="text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  {senderInfo.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            {senderInfo.online && (
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-white"></span>
            )}
          </div>
        </div>
      )}
      
      {/* No spacer needed for sequential user messages to align properly with right edge */}
    </motion.div>
  )
}
