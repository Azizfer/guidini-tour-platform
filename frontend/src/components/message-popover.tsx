"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, MessageSquare, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Message {
  id: string
  sender: {
    name: string
    avatar?: string
    online?: boolean
  }
  content: string
  time: string
  unread: boolean
}

interface MessagePopoverProps {
  onOpenChat: (user: { name: string; avatar?: string }) => void
  onViewAllMessages: () => void
}

const dummyMessages: Message[] = [
  {
    id: "1",
    sender: {
      name: "Ahmed",
      avatar: "/placeholder.svg?height=40&width=40&text=A",
      online: true,
    },
    content: "Bonjour, je suis intéressé par votre visite guidée à Carthage.",
    time: "10:30",
    unread: true,
  },
  {
    id: "2",
    sender: {
      name: "Sarah",
      avatar: "/placeholder.svg?height=40&width=40&text=S",
      online: false,
    },
    content: "Est-ce que la visite de Sidi Bou Said est disponible demain?",
    time: "Hier",
    unread: true,
  },
  {
    id: "3",
    sender: {
      name: "Mohamed",
      avatar: "/placeholder.svg?height=40&width=40&text=M",
      online: true,
    },
    content: "Merci pour les informations sur Djerba!",
    time: "Lun",
    unread: false,
  },
  {
    id: "4",
    sender: {
      name: "Leila",
      avatar: "/placeholder.svg?height=40&width=40&text=L",
      online: false,
    },
    content: "Pouvez-vous me recommander un guide pour Kairouan?",
    time: "23/04",
    unread: false,
  },
]

export default function MessagePopover({ onOpenChat, onViewAllMessages }: MessagePopoverProps) {
  const [messages, setMessages] = useState<Message[]>(dummyMessages)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMessages = messages.filter(
    (message) =>
      message.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const markAsRead = (id: string) => {
    setMessages(messages.map((message) => (message.id === id ? { ...message, unread: false } : message)))
  }

  const deleteMessage = (id: string) => {
    setMessages(messages.filter((message) => message.id !== id))
  }

  const unreadCount = messages.filter((message) => message.unread).length

  const handleMessageClick = (message: Message) => {
    markAsRead(message.id)
    onOpenChat(message.sender)
  }

  return (
    <div className="w-[350px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 absolute right-0">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            Messages
            {unreadCount > 0 && (
              <span className="bg-gray-100 text-gray-800 text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
            )}
          </h3>
        </div>
        <div className="mt-2 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 h-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="max-h-[350px]">
        {filteredMessages.length > 0 ? (
          <div className="p-2">
            {filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "relative bg-white border rounded-lg p-3 mb-2 cursor-pointer",
                  message.unread ? "border-gray-200 bg-gray-50" : "border-gray-100",
                )}
                onClick={() => handleMessageClick(message)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0">
                    <img
                      src={message.sender.avatar || "/placeholder.svg"}
                      alt={message.sender.name}
                      className="rounded-full object-cover h-10 w-10"
                    />
                    {message.sender.online && (
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-medium", message.unread ? "text-gray-900" : "text-gray-700")}>
                        {message.sender.name}
                      </p>
                      <span className="text-xs text-gray-400">{message.time}</span>
                    </div>
                    <p
                      className={cn(
                        "text-[13px] mt-0.5 line-clamp-2",
                        message.unread ? "text-gray-700" : "text-gray-500",
                      )}
                    >
                      {message.content}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteMessage(message.id)
                  }}
                  className={cn(
                    "absolute top-3 right-3 rounded-lg flex items-center justify-center h-6 w-6 p-0",
                    "hover:bg-red-50 text-gray-400 hover:text-red-600",
                    "transition-colors",
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {message.unread && <div className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-blue-500" />}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="flex justify-center mb-2">
              <MessageSquare className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm">Aucun message trouvé</p>
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 w-full flex items-center justify-center gap-1 group"
          onClick={onViewAllMessages}
        >
          <span>Voir tous les messages</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </div>
  )
}
