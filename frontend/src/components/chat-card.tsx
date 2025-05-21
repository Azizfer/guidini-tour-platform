"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, X, Phone, Video, Send, Paperclip, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import ChatBubble from "./chat-bubble"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatCardProps {
  user: {
    name: string
    avatar?: string
    online?: boolean
  }
  onClose: () => void
  onMinimize: () => void
}

interface Message {
  id: string
  content: string
  sender: "user" | "other"
  timestamp: Date
}

export default function ChatCard({ user, onClose, onMinimize }: ChatCardProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Bonjour, comment puis-je vous aider?",
      sender: "other",
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, message])
    setNewMessage("")

    // Simulate reply after 1-2 seconds
    setTimeout(
      () => {
        const replies = [
          "D'accord, je comprends.",
          "Merci pour l'information.",
          "Je vais vérifier cela pour vous.",
          "Avez-vous besoin d'autre chose?",
          "Je suis là pour vous aider.",
        ]

        const reply: Message = {
          id: (Date.now() + 1).toString(),
          content: replies[Math.floor(Math.random() * replies.length)],
          sender: "other",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, reply])
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-[320px] h-[400px] bg-gray-900 rounded-t-lg shadow-xl flex flex-col overflow-hidden border border-gray-800"
    >
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-9 w-9 border-2 border-white/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-teal-700 text-white">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {user.online && (
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-teal-100">{user.online ? "En ligne" : "Hors ligne"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            onClick={onMinimize}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 bg-white dark:bg-gray-900 space-y-1">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            senderInfo={{
              name: message.sender === "user" ? "Vous" : user.name,
              avatar: message.sender === "user" ? undefined : user.avatar,
              online: message.sender === "user" ? false : user.online
            }}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <div className="relative flex-1">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez un message..."
            className="pr-10 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-teal-500"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="default"
          size="icon"
          className="h-8 w-8 rounded-full bg-teal-500 hover:bg-teal-600 text-white"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
