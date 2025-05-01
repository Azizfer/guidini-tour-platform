"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, X, Mail } from "lucide-react"

interface Message {
  id: string
  sender: {
    name: string
    avatar?: string
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
    <div className="w-[400px] bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <Mail className="h-4 w-4 text-teal-600" />
            Messages
            {unreadCount > 0 && (
              <span className="bg-teal-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
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

      <ScrollArea className="max-h-[400px]">
        {filteredMessages.length > 0 ? (
          <div className="p-2">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 mb-1 rounded-md hover:bg-gray-50 transition-colors relative cursor-pointer ${
                  message.unread ? "bg-teal-50" : ""
                }`}
                onClick={() => handleMessageClick(message)}
              >
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white">
                      {message.sender.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-gray-800 truncate">{message.sender.name}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{message.content}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteMessage(message.id)
                  }}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
                {message.unread && <div className="absolute right-2 bottom-2 h-2 w-2 rounded-full bg-teal-500"></div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p>Aucun message trouvé</p>
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-gray-200 text-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 w-full"
          onClick={onViewAllMessages}
        >
          Voir tous les messages
        </Button>
      </div>
    </div>
  )
}
