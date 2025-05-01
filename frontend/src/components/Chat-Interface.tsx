"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, X, Paperclip, ImageIcon, Smile, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatInterfaceProps {
  user: {
    name: string
    avatar?: string
  }
  onClose: () => void
}

interface Message {
  id: string
  content: string
  sender: "user" | "other"
  timestamp: Date
  status?: "sending" | "sent" | "delivered" | "read"
}

export default function ChatInterface({ user, onClose }: ChatInterfaceProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: `Bonjour ! Vous discutez avec ${user.name}. Comment puis-je vous aider ?`,
      sender: "other",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isExpanded])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate response delay
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getRandomResponse(),
        sender: "other",
        timestamp: new Date(),
      }

      // Update status of user message
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "read" } : msg)))

      setMessages((prev) => [...prev, responseMessage])
      setIsLoading(false)
    }, 1500)
  }

  const getRandomResponse = () => {
    const responses = [
      "Merci pour votre message ! Je vais vérifier et vous répondre dès que possible.",
      "C'est noté. Avez-vous d'autres questions concernant votre visite ?",
      "Bien sûr, je peux vous aider avec ça. Pouvez-vous me donner plus de détails ?",
      "Je comprends votre demande. Laissez-moi vérifier les disponibilités.",
      "Excellente question ! Je vais me renseigner et revenir vers vous rapidement.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="fixed bottom-16 right-4 z-40 flex flex-col items-end">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: 20, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`bg-white rounded-lg shadow-xl overflow-hidden mb-3 border border-gray-200 ${
            isExpanded ? "w-[350px]" : "w-[250px]"
          }`}
        >
          {/* Header */}
          <div className="bg-teal-500 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-white/20">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-teal-700 text-white">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-medium text-sm">{user.name}</h3>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                onClick={toggleExpand}
              >
                {isExpanded ? <X className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {isExpanded && (
            <>
              <ScrollArea className="h-[350px] p-3 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "other" && (
                        <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-teal-500 text-white">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-2.5 text-sm ${
                          message.sender === "user"
                            ? "bg-teal-500 text-white rounded-tr-none"
                            : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            message.sender === "user" ? "text-white/70 text-right" : "text-gray-400"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {message.sender === "user" && message.status && (
                            <span className="ml-1">
                              {message.status === "sending" && "⋯"}
                              {message.status === "sent" && "✓"}
                              {message.status === "delivered" && "✓✓"}
                              {message.status === "read" && "✓✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-teal-500 text-white">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="max-w-[80%] rounded-lg p-2.5 bg-white text-gray-800 border border-gray-200 rounded-tl-none">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-500" />
                          <p className="text-xs text-gray-400">En train d'écrire...</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-2 bg-gray-100 border-t border-gray-200 flex gap-2">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 text-sm h-9 bg-white border-gray-200 text-gray-800 placeholder:text-gray-500 focus-visible:ring-teal-600"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-full h-9 w-9 p-0"
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
