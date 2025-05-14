"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Loader2, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const adjustHeight = (reset = false) => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (reset) {
      textarea.style.height = "40px"
      return
    }

    textarea.style.height = "40px"
    const scrollHeight = textarea.scrollHeight
    textarea.style.height = `${Math.min(scrollHeight, 200)}px`
  }

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
    adjustHeight(true)
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chatbot container */}
      <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-end ${isOpen ? "w-[380px]" : "w-auto"}`}>
        {/* Chatbot modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="w-full overflow-hidden mb-3"
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ maxHeight: "80vh" }}
            >
              <Card className="border-none shadow-xl rounded-[30px] overflow-hidden backdrop-blur-sm bg-white/95">
                {/* Header */}
                <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-3 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Guidini Assistant</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0">
                  <div className="h-[350px] overflow-y-auto p-4 bg-gray-50/80">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {message.role === "assistant" && (
                            <div className="w-2 h-2 mr-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex-shrink-0 mt-2"></div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-[18px] p-3 text-sm ${
                              message.role === "user"
                                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-tr-none shadow-md"
                                : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-md"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="w-2 h-2 mr-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex-shrink-0 mt-2"></div>
                          <div className="max-w-[80%] rounded-[18px] p-3 bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-md">
                            <div className="flex items-center">
                              <div className="flex space-x-1">
                                <div
                                  className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                                  style={{ animationDelay: "0ms" }}
                                ></div>
                                <div
                                  className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                                  style={{ animationDelay: "150ms" }}
                                ></div>
                                <div
                                  className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
                                  style={{ animationDelay: "300ms" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </CardContent>

                {/* Input */}
                <CardFooter className="p-3 bg-white/90 border-t border-gray-100">
                  <div className="w-full rounded-[20px] bg-black/5 p-1">
                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value)
                          adjustHeight()
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Tapez votre message..."
                        className={cn(
                          "w-full rounded-[18px] pl-3 pr-10 placeholder:text-black/50 border-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black resize-none text-wrap py-2.5 bg-transparent",
                          "min-h-[45px] text-sm",
                        )}
                        disabled={isLoading}
                      />

                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <button
                          type="button"
                          onClick={handleSendMessage}
                          disabled={!input.trim() || isLoading}
                          className={cn(
                            "rounded-full bg-gradient-to-r from-teal-500 to-teal-600 p-2 text-white shadow-md transition-all hover:shadow-lg",
                            (!input.trim() || isLoading) && "opacity-50",
                          )}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ArrowRight className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chatbot toggle button */}
        <motion.button
          className={`rounded-full shadow-lg flex items-center justify-center ${
            isOpen
              ? "bg-red-500 hover:bg-red-600 w-12 h-12"
              : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 w-14 h-14"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
              />
            </svg>
          )}
        </motion.button>
      </div>
    </>
  )
}
