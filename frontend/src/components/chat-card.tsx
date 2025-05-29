"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, X, Send, Loader2, MessageSquare } from "lucide-react"
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

  // Get current user ID from JWT token
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
            .join("")
        )

        const payload = JSON.parse(jsonPayload)
        return payload._id || payload.userId || payload.id
      }
    } catch (e) {
      console.error("Error getting current user ID:", e)
    }

    // No fallback ID - user must be logged in
    return ""
  }

  const currentUserId = getCurrentUserId()

  // Process messages to determine which ones are sequential (from the same sender)
  const processedMessages = messages.map((message, index) => {
    // Check if this message is from the same sender as the previous one
    const isSequential = index > 0 && 
      ((message.sender?._id === messages[index - 1].sender?._id) || 
       (message._id?.startsWith('temp-') && messages[index - 1]._id?.startsWith('temp-')));
    
    return {
      ...message,
      isSequential
    };
  });

  // Focus input when component mounts and when messages change
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
    
    // Also scroll to bottom when messages change
    scrollToBottom()
  }, [messages])

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

  // Monitor messages and active chat
  useEffect(() => {
    // Messages or active chat changed
  }, [messages, activeChat])

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !activeChat) return

    try {
      // Store the message content and clear the input immediately
      const messageContent = newMessage
      setNewMessage("") // Clear input field right away for better UX

      // Send the message to the backend
      await sendMessage(messageContent, activeChat.id)
      
      // Focus back on input after sending
      inputRef.current?.focus()
      
      // Ensure we scroll to the bottom after sending
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error("Error sending message:", error)
    }
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
      className="w-[320px] h-[420px] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-100 fixed bottom-20 right-4 z-50 backdrop-blur-sm bg-opacity-95"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 px-3 rounded-t-xl shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Avatar className="h-8 w-8 border border-white/90 shadow-sm">
              <AvatarImage src={activeChat.avatar || "/placeholder.svg"} alt={activeChat.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-medium text-xs">
                {activeChat.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {activeChat.online && (
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-400 border border-white animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-xs">{activeChat.name}</h3>
            <p className="text-xs text-white/80 text-[10px]">{activeChat.online ? "En ligne" : "Hors ligne"}</p>
          </div>
        </div>
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-6 w-6 rounded-full transition-all duration-200 p-0 border border-white/20 backdrop-blur-sm"
                  onClick={onMinimize}
                >
                  <Minus className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-gray-800 text-white border-none">
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
                  className="text-white hover:bg-red-500/20 h-6 w-6 rounded-full transition-all duration-200 p-0 border border-white/20 backdrop-blur-sm"
                  onClick={() => {
                    // Close the chat card and completely remove the bubble
                    onClose();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-gray-800 text-white border-none">
                <p className="text-xs">Close</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50/30 to-white space-y-1 scroll-smooth custom-scrollbar"
        id="messages-container"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
      >
        {loadingMessages && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-gray-100">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500 mb-3" />
              <p className="text-sm text-gray-600 font-medium">Chargement des messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-5 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50/50 max-w-xs shadow-sm border border-blue-100/50">
              <div className="mb-3 text-blue-500/80">
                <MessageSquare className="h-10 w-10 mx-auto opacity-80" />
              </div>
              <p className="text-gray-700 text-sm mb-2 font-medium">
                Commencez à discuter avec <span className="font-semibold text-teal-600">{activeChat.name}</span>
              </p>
              <p className="text-xs text-gray-500">Envoyez un message pour démarrer la conversation</p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {processedMessages.map((message, index) => {
              const isUser = (message.sender && message.sender._id === currentUserId) || 
                           (message._id && message._id.startsWith("temp-"));
              
              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <ChatBubble
                    message={{
                      id: message._id || `msg-${index}`,
                      content: message.content || '',
                      sender: isUser ? "user" : "other",
                      timestamp: new Date(message.createdAt || Date.now()),
                    }}
                    senderInfo={{
                      name: isUser
                          ? "Vous"
                          : (activeChat && activeChat.name) || 'Contact',
                      avatar: isUser
                          ? localStorage.getItem('userAvatar') || undefined
                          : (activeChat && activeChat.avatar),
                      online: isUser
                          ? true
                          : (activeChat && activeChat.online) || false,
                    }}
                    isSequential={message.isSequential}
                    showAvatar={true}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez un message..."
            className="pr-10 bg-gray-50/80 border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 focus-visible:ring-teal-500 focus-visible:ring-offset-0 h-11 transition-all shadow-sm"
          />
        </div>

        <Button
          variant="default"
          size="icon"
          className={cn(
            "h-11 w-11 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-md transition-all duration-200",
            !newMessage.trim() && "opacity-70 cursor-not-allowed",
          )}
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Send className="h-5 w-5" />  
        </Button>
      </div>
    </motion.div>
  )
}
