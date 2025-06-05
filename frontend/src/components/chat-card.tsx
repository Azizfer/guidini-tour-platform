"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, X, Send, Loader2, MessageSquare, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence, useTransform } from "framer-motion"
import ChatBubble from "./chat-bubble"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChat } from "@/contexts/chat-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Pacifico } from "next/font/google"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

interface ChatCardProps {
  onClose: () => void
  onMinimize: () => void
}

// Removed Sparkle component

export default function ChatCard({ onClose, onMinimize }: ChatCardProps) {
  const { activeChat, messages, sendMessage, loadingMessages } = useChat()
  const [newMessage, setNewMessage] = useState("")
  const [messagesRead, setMessagesRead] = useState(false)
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

  // Process messages to determine which ones are sequential and when to show timestamps
  const processedMessages = messages.map((message, index) => {
    // Check if this message is from the same sender as the previous one
    const isSequential = index > 0 && 
      ((message.sender?._id === messages[index - 1].sender?._id) || 
       (message._id?.startsWith('temp-') && messages[index - 1]._id?.startsWith('temp-')));
    
    // Check if this message is more than 30 minutes after the previous one
    let showTimestamp = false;
    if (index > 0) {
      const currentTime = new Date(message.createdAt || Date.now()).getTime();
      const prevTime = new Date(messages[index - 1].createdAt || Date.now()).getTime();
      const timeDiff = currentTime - prevTime;
      // 30 minutes = 30 * 60 * 1000 milliseconds
      showTimestamp = timeDiff > 30 * 60 * 1000;
    }
    
    return {
      ...message,
      isSequential,
      showTimestamp
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

  // Mark messages as read when chat card is opened
  const markMessagesAsRead = async () => {
    if (activeChat && !messagesRead) {
      try {
        // Call API to mark messages as read
        const token = localStorage.getItem('token')
        if (token && activeChat.id) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/read/${activeChat.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            setMessagesRead(true)
            console.log('Messages marked as read')
          }
        }
      } catch (error) {
        console.error('Error marking messages as read:', error)
      }
    }
  }

  // Monitor messages and active chat
  useEffect(() => {
    // Mark messages as read when chat is opened
    if (activeChat && messages.length > 0) {
      markMessagesAsRead()
    }
    
    // Reset read state when active chat changes
    if (activeChat) {
      setMessagesRead(false)
    }
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-[320px] h-[420px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-blue-200 fixed bottom-20 right-4 z-50 backdrop-blur-sm bg-opacity-95"
    >
      {/* Header - more compact */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 px-3 flex items-center justify-between rounded-t-xl shadow-sm relative overflow-hidden">
        <div className="flex items-center">
          <div className="relative mr-2">
            <Avatar className="h-7 w-7 border border-white/80">
              <AvatarImage src={activeChat?.avatar || `/placeholder.svg?height=200&width=200&text=${activeChat?.name.charAt(0)}`} alt={activeChat?.name} />
              <AvatarFallback className="bg-amber-200 text-amber-800">
                {activeChat?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {activeChat?.online && (
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-white"></span>
            )}
          </div>
          <div>
            <h3 className="font-normal text-sm leading-tight">{activeChat?.name}</h3>
            <p className="text-[10px] text-white/80 leading-tight">{activeChat?.online ? "En ligne" : "Hors ligne"}</p>
          </div>
        </div>

        <div className="flex space-x-1">
          <button
            className="text-white/90 h-5 w-5 flex items-center justify-center"
            onClick={onMinimize}
          >
            <Minus className="h-3 w-3" />
          </button>

          <button
            className="text-white/90 h-5 w-5 flex items-center justify-center"
            onClick={() => {
              // Close the chat card and completely remove the bubble
              onClose();
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Messages - improved design */}
      <div className="flex-1 overflow-y-auto pl-2 pr-0 py-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent bg-gradient-to-b from-blue-50 to-white">
        {loadingMessages && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center bg-white/90 p-3 rounded-lg shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500 mb-1" />
              <p className="text-xs text-amber-600 font-medium">Chargement des messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center text-center p-4 h-full relative"
          >
            <div className="bg-white/90 p-3 rounded-lg shadow-sm max-w-xs">
              <motion.div 
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 2, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-2 w-14 h-14 flex items-center justify-center mx-auto mb-3 shadow-lg"
              >
                <div className="bg-gradient-to-br from-blue-100 to-white rounded-full p-2 w-10 h-10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
              </motion.div>
              <h3 className={cn("text-lg font-normal text-gray-800 mb-2")}>Commencez à discuter avec Guide Test1</h3>
              <p className="text-xs text-gray-600">Envoyez un message pour démarrer la conversation</p>
            </div>
            {/* Removed decorative elements */}
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {processedMessages.map((message, index) => {
              const isUser = (message.sender && message.sender._id === currentUserId) || 
                           (message._id && message._id.startsWith("temp-"));
              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  className="mb-0.5"
                >
                  {!isUser && message.showTimestamp && (
                    <div className="w-full flex justify-center my-1">
                      <div className="bg-gray-800 text-white text-[10px] px-3 py-0.5 rounded-full font-medium">
                        {new Intl.DateTimeFormat('fr-FR', {
                          weekday: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(new Date(message.createdAt || Date.now()))}
                      </div>
                    </div>
                  )}
                  <div className={`relative ${isUser ? 'w-full flex justify-end' : ''}`}>
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
                      onClose={() => {
                        // Only allow closing messages that aren't from the current user
                        if (!isUser && message._id) {
                          console.log(`Closing message: ${message._id}`);
                          // Here you would implement the logic to remove this message
                          // For now, we'll just log it
                        }
                      }}
                      isSequential={message.isSequential}
                      showAvatar={!isUser}
                    />
                    {isUser && index === processedMessages.length - 1 && (
                      <div className="absolute -bottom-4 right-2 flex items-center">
                        <span className="text-[9px] text-gray-500 mr-1">{messagesRead ? 'Vu' : 'Envoyé'}</span>
                        <Check className={`h-3 w-3 ${messagesRead ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input - more compact */}
      <div className="border-t border-teal-100/50 p-2 bg-gradient-to-r from-blue-50 to-teal-50 rounded-b-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center space-x-2"
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder="Écrivez un message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 focus-visible:ring-blue-500 rounded-full border-blue-200 bg-white text-xs py-1 px-3 h-8 shadow-inner"
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            size="icon"
            className={cn(
              "rounded-full h-8 w-8 bg-blue-600 transition-all shadow-sm hover:bg-blue-700",
              newMessage.trim() === "" && "opacity-50 cursor-not-allowed"
            )}
            disabled={newMessage.trim() === ""}
          >
            <Send className="h-3 w-3 text-white" />
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
