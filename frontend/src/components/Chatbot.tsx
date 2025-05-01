"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MessageCircle, X, Loader2, MessageSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Bonjour ! Je suis votre assistant Guidini. Comment puis-je vous aider aujourd'hui ?",
      role: "assistant",
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
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      console.log("Envoi de la requête au backend...")
      // Pour le développement local, utilisez une URL relative pour éviter les problèmes CORS
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: messages.slice(1).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      console.log("Statut de la réponse:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erreur de réponse:", errorText)
        throw new Error(`Erreur ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("Données reçues:", data)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          data.response || "Je n'ai pas pu générer une réponse appropriée. Pourriez-vous reformuler votre question ?",
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error("Erreur détaillée:", error)

      // Message d'erreur plus informatif pour le débogage
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Désolé, je rencontre des difficultés techniques. Erreur: ${
          error.message || "Inconnue"
        }. Veuillez vérifier que le serveur backend est en cours d'exécution.`,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chatbot container */}
      <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-end ${isOpen ? "w-[350px]" : "w-auto"}`}>
        {/* Chatbot modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="w-full bg-white rounded-lg shadow-xl overflow-hidden mb-3 border border-gray-200"
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ maxHeight: "80vh" }}
            >
              {/* Header */}
              <div className="bg-teal-500 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <h3 className="font-medium text-sm">Guidini Assistant</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="h-[350px] overflow-y-auto p-3 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-7 h-7 mr-2 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-2.5 text-sm ${
                          message.role === "user"
                            ? "bg-teal-500 text-white rounded-tr-none"
                            : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="w-7 h-7 mr-2 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-3.5 w-3.5 text-white" />
                      </div>
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
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-2 bg-gray-100 border-t border-gray-200 flex gap-2">
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chatbot toggle button */}
        <motion.button
          className={`rounded-full shadow-lg flex items-center justify-center ${
            isOpen ? "bg-red-500 hover:bg-red-600 w-10 h-10" : "bg-teal-500 hover:bg-teal-600 w-12 h-12"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5 text-white" /> : <MessageSquare className="h-5 w-5 text-white" />}
        </motion.button>
      </div>
    </>
  )
}
