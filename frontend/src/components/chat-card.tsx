"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, X, Send, Paperclip, Smile, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import ChatBubble from "./chat-bubble"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChat } from "@/contexts/chat-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatCardProps {
  onClose: () => void
  onMinimize: () => void
}

export default function ChatCard({ onClose, onMinimize }: ChatCardProps) {
  const { activeChat, messages, sendMessage, loadingMessages } = useChat()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get current user ID from the JWT token
  const getCurrentUserId = (): string => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        // Simple JWT parsing
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        )

        const payload = JSON.parse(jsonPayload)
        return payload._id || payload.userId || payload.id
      }
    } catch (e) {
      console.error("Error getting current user ID:", e)
    }

    // Fallback to hardcoded ID if token parsing fails
    return "682e10803651e668c119fbaf"
  }

  const currentUserId = getCurrentUserId()

  // Add debugging logs
  useEffect(() => {
    console.log("ChatCard - Active Chat:", activeChat)
    console.log("ChatCard - Messages:", messages)
    console.log("ChatCard - Loading Messages:", loadingMessages)
  }, [activeChat, messages, loadingMessages])

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    const container = document.getElementById("messages-container")
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  // Handle sending a new message
  const handleNewMessage = () => {
    setTimeout(scrollToBottom, 50)
  }

  // Track if we're adding a new message
  const prevMessagesLength = useRef(0)

  useEffect(() => {
    // Only scroll when new messages are added
    if (messages.length > prevMessagesLength.current) {
      handleNewMessage()
    }

    // Update the previous messages length
    prevMessagesLength.current = messages.length
  }, [messages])

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !activeChat) return

    // Store the message content and clear the input immediately
    const messageContent = newMessage
    setNewMessage("") // Clear input field right away for better UX

    // Send the message
    await sendMessage(messageContent, activeChat.id)

    // Focus back on input after sending
    inputRef.current?.focus()

    // Manually trigger scroll to bottom
    handleNewMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!activeChat) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-[350px] h-[450px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 fixed bottom-20 right-4 z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-9 w-9 border-2 border-white/80 shadow-sm">
              <AvatarImage src={activeChat.avatar || "/placeholder.svg"} alt={activeChat.name} />
              <AvatarFallback className="bg-blue-700 text-white">
                {activeChat.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {activeChat.online && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{activeChat.name}</h3>
            <p className="text-xs text-blue-100 opacity-90">{activeChat.online ? "En ligne" : "Hors ligne"}</p>
          </div>
        </div>
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-8 w-8 rounded-full transition-colors"
                  onClick={onMinimize}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Minimize</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 h-8 w-8 rounded-full transition-colors"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Close</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white space-y-2 scroll-smooth"
        id="messages-container"
      >
        {loadingMessages && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
              <Loader2 className="h-7 w-7 animate-spin text-blue-500 mb-2" />
              <p className="text-sm text-gray-500">Chargement des messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4 rounded-lg bg-blue-50 max-w-xs">
              <p className="text-gray-600 text-sm mb-2">
                Commencez à discuter avec <span className="font-medium text-blue-600">{activeChat.name}</span>
              </p>
              <p className="text-xs text-gray-500">Envoyez un message pour démarrer la conversation</p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <ChatBubble
                  message={{
                    id: message._id,
                    content: message.content,
                    sender: message.sender._id === currentUserId || message._id.startsWith("temp-") ? "user" : "other",
                    timestamp: new Date(message.createdAt),
                  }}
                  senderInfo={{
                    name:
                      message.sender._id === currentUserId || message._id.startsWith("temp-")
                        ? "Vous"
                        : activeChat.name,
                    avatar:
                      message.sender._id === currentUserId || message._id.startsWith("temp-")
                        ? undefined
                        : activeChat.avatar,
                    online:
                      message.sender._id === currentUserId || message._id.startsWith("temp-")
                        ? false
                        : activeChat.online,
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 shadow-sm flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Attach file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez un message..."
            className="pr-10 bg-gray-50 border-gray-200 rounded-full text-gray-900 placeholder:text-gray-500 focus-visible:ring-blue-500 focus-visible:ring-offset-0 h-10 transition-all"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">Add emoji</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button
          variant="default"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all",
            !newMessage.trim() && "opacity-70",
          )}
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
