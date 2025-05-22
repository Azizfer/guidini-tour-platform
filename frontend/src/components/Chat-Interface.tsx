"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, X, Paperclip, ImageIcon, Smile, Loader2, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat, ChatUser } from "@/contexts/chat-context"
import ChatCard from "./chat-card"

export default function ChatInterface() {
  const { 
    activeChat, 
    isChatOpen, 
    isChatBubbleOpen, 
    messages, 
    unreadCount,
    sendMessage, 
    openChat, 
    closeChat, 
    minimizeChat, 
    maximizeChat,
    toggleChatBubble 
  } = useChat()
  
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Get current user ID from the chat context
  const currentUserId = "682e10803651e668c119fbaf"; // Aziz Ferchichi's ID
  
  // Determine if there are any unread messages for the active chat
  const hasUnreadMessages = activeChat ? messages.some(
    msg => msg.sender._id === activeChat.id && !msg.readBy.includes(currentUserId)
  ) : false;

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isChatOpen])

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || !activeChat) return

    sendMessage(input, activeChat.id)
    setInput("")
  }

  return (
    <div className="fixed bottom-0 right-0 z-40 flex flex-col items-end">
      {/* Chat Card */}
      {isChatOpen && activeChat && (
        <ChatCard onClose={closeChat} onMinimize={minimizeChat} />
      )}

      {/* Chat Bubble - Improved position and styling */}
      {isChatBubbleOpen && activeChat && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-16 right-4 z-50 flex items-center gap-2"
        >
          <motion.div 
            className="bg-white rounded-lg shadow-lg p-2 max-w-[200px] overflow-hidden text-ellipsis"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={activeChat.avatar} alt={activeChat.name} />
                <AvatarFallback className="bg-blue-500 text-white text-xs">
                  {activeChat.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium truncate">{activeChat.name}</span>
            </div>
          </motion.div>
          <motion.div
            className="bg-blue-600 text-white rounded-full p-3 shadow-lg cursor-pointer"
            onClick={maximizeChat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <MessageSquare className="h-6 w-6" />
              {hasUnreadMessages && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  !
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
