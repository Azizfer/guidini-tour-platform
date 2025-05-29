"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Loader2, ArrowRight, ChevronUp, ChevronDown } from "lucide-react"
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
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  // Slider state
  const [showSlider, setShowSlider] = useState(false)

  // Scroll functions for the slider
  const scrollUp = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollBy({
        top: -100,
        behavior: "smooth"
      });
    }
  };

  const scrollDown = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollBy({
        top: 100,
        behavior: "smooth"
      });
    }
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  // Check if scrolling is needed
  const checkScrollable = () => {
    const container = messagesContainerRef.current;
    if (container) {
      setShowSlider(container.scrollHeight > container.clientHeight);
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
    // Check if we need to show the slider after messages update
    setTimeout(checkScrollable, 100);
  }, [messages]);
  
  // Add scroll event listener to show/hide slider
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const handleScroll = () => {
        checkScrollable();
      };
      
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

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

  // Utilitaire de journalisation d'erreur sécurisée
  const safeLogError = (message: string, error?: unknown) => {
    try {
      if (typeof console !== 'undefined' && console.error) {
        const safeMessage = String(message).substring(0, 200);
        if (error === undefined) {
          console.error(safeMessage);
        } else {
          // Éviter les problèmes de sérialisation en extrayant seulement les propriétés importantes
          let errorInfo = '';
          if (typeof error === 'object' && error !== null) {
            const errorObj = error as any;
            errorInfo = `${errorObj.name || 'Error'}: ${errorObj.message || 'Unknown error'}`;
            if (errorObj.stack) {
              // Prendre seulement la première ligne de la stack trace
              const stackFirstLine = errorObj.stack.split('\n')[0];
              errorInfo += ` | ${stackFirstLine}`;
            }
          } else {
            errorInfo = String(error);
          }
          console.error(safeMessage, errorInfo.substring(0, 200));
        }
      }
    } catch (logError) {
      // Solution de secours absolue si même la journalisation des erreurs échoue
      if (typeof console !== 'undefined' && console.log) {
        console.log('Échec de la journalisation correcte de l\'erreur');
      }
    }
  };

  // Gestionnaire de réponse API amélioré
  const handleApiResponse = async (response: Response): Promise<any> => {
    try {
      if (!response || !response.ok) {
        let errorText = 'Erreur inconnue';
        let statusCode = 500;

        try {
          statusCode = response?.status || 500;
          errorText = await response.text();
          
          // Essayer de parser en JSON si possible
          try {
            const jsonError = JSON.parse(errorText);
            errorText = jsonError.message || jsonError.error || errorText;
          } catch {
            // Pas du JSON, conserver le texte original
          }
        } catch (parseError) {
          safeLogError('Échec de l\'analyse de la réponse d\'erreur', parseError);
        }

        // Assainir le message d'erreur
        const safeErrorMessage = String(errorText)
          .replace(/[^\x20-\x7E]/g, '')
          .substring(0, 500);

        safeLogError(`Erreur API ${statusCode}`, safeErrorMessage);
        throw new Error(`Erreur API: ${safeErrorMessage}`);
      }

      try {
        return await response.json();
      } catch (jsonError) {
        safeLogError('Échec de l\'analyse de la réponse réussie', jsonError);
        throw new Error('Format de réponse API invalide');
      }
    } catch (error) {
      safeLogError('Erreur inattendue dans le traitement de l\'API', error);
      throw new Error('Échec du traitement de la réponse API');
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    adjustHeight(true);
    setIsLoading(true);

    try {
      console.log("Envoi de la requête au backend...");
      // Utiliser l'URL complète du backend pour éviter les problèmes CORS
      const response = await fetch("http://localhost:5001/api/chat", {
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
      });

      console.log("Statut de la réponse:", response.status);

      const data = await handleApiResponse(response);
      console.log("Données reçues:", data);

      // Vérifier si la réponse contient une erreur spécifique
      if (data.error === "API_KEY_INVALID") {
        throw new Error("API_KEY_INVALID");
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          data.response || "Je n'ai pas pu générer une réponse appropriée. Pourriez-vous reformuler votre question ?",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      safeLogError("Erreur détaillée", error);

      // Message d'erreur personnalisé en fonction du type d'erreur
      let errorContent = "";

      if (error.message === "API_KEY_INVALID" || 
          (error.response && error.response.error === "SERVICE_DOWN") ||
          (error.response && error.response.error === "SERVICE_UNAVAILABLE")) {
        errorContent = "Le service de chat est temporairement indisponible. L'administrateur doit configurer une clé API Gemini valide.";
        
        // Afficher des instructions pour l'administrateur dans la console
        console.info("Pour résoudre ce problème, vérifiez que la clé GEMINI_API_KEY dans le fichier .env du backend est valide.");
        console.info("Vous pouvez obtenir une clé API Gemini sur https://ai.google.dev/");
      } else if (error.message && error.message.includes("Failed to fetch")) {
        errorContent = "Impossible de se connecter au serveur. Veuillez vérifier que le serveur backend est en cours d'exécution sur le port 5001.";
      } else {
        errorContent = "Je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants.";
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end space-y-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[320px] h-[400px] flex flex-col"
            >
              <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden h-full flex flex-col">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 py-2 px-4 text-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white/20 rounded-full p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-4.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-medium text-base">Guidini Assistant</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20 rounded-full h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0 flex-grow relative">
                  {/* Slider controls */}
                  {showSlider && (
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 z-10">
                      <button 
                        className="w-6 h-6 rounded-full bg-teal-100 hover:bg-teal-200 flex items-center justify-center text-teal-700 shadow-sm transition-colors"
                        onClick={scrollUp}
                        aria-label="Scroll up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button 
                        className="w-6 h-6 rounded-full bg-teal-100 hover:bg-teal-200 flex items-center justify-center text-teal-700 shadow-sm transition-colors"
                        onClick={scrollDown}
                        aria-label="Scroll down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div className="h-full overflow-y-auto" ref={messagesContainerRef}>
                    <div className="p-3 space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.role === "user" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[85%] rounded-xl px-3 py-1",
                              message.role === "user"
                                ? "bg-teal-500 text-white rounded-tr-none"
                                : "bg-gray-100 text-gray-800 rounded-tl-none"
                            )}
                          >
                            <div className="text-xs">{message.content}</div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-xl px-3 py-1.5 bg-gray-100 text-gray-800 rounded-tl-none">
                            <div className="flex items-center space-x-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"></div>
                              <div
                                className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              ></div>
                              <div
                                className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </CardContent>

                {/* Input */}
                <CardFooter className="p-2 bg-white/90 border-t border-gray-100">
                  <div className="w-full rounded-[16px] bg-black/5 p-1">
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
                          "w-full rounded-[14px] pl-2.5 pr-8 placeholder:text-black/50 border-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black resize-none text-wrap py-1.5 bg-transparent",
                          "min-h-[36px] text-xs",
                        )}
                        disabled={isLoading}
                      />

                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                        <button
                          type="button"
                          onClick={handleSendMessage}
                          disabled={!input.trim() || isLoading}
                          className={cn(
                            "rounded-full bg-gradient-to-r from-teal-500 to-teal-600 p-1.5 text-white shadow-sm transition-all hover:shadow-md",
                            (!input.trim() || isLoading) && "opacity-50",
                          )}
                        >
                          {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ArrowRight className="w-3 h-3" />
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
          className={`rounded-full shadow-md flex items-center justify-center ${
            isOpen
              ? "bg-red-500 hover:bg-red-600 w-10 h-10"
              : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 w-11 h-11"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-4 w-4 text-white" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5 text-white"
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
