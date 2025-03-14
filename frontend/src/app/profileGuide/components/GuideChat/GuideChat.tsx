"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ChatList from "./components/ChatList"
import MessageList from "./components/MessageList"
import MessageInput from "./components/MessageInput"
import { mockChats, mockMessages } from "./mockData"

// Composant principal GuideChat
export default function GuideChat() {
  const [chats, setChats] = useState(mockChats || []) // Ensure chats is always an array
  const [messages, setMessages] = useState(mockMessages) // Liste des messages par conversation
  const [selectedChat, setSelectedChat] = useState<string | null>(null) // ID de la conversation sélectionnée
  const [newMessage, setNewMessage] = useState("") // Contenu du nouveau message
  const messagesEndRef = useRef<HTMLDivElement>(null) // Référence pour le défilement automatique
  const [isClient, setIsClient] = useState(false) // Indicateur pour déterminer si le code est exécuté sur le client

  // Effect to detect client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Défilement automatique vers le bas lors de la sélection d'une conversation
  useEffect(() => {
    if (selectedChat && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedChat])

  // Fonction pour sélectionner une conversation
  const selectChat = (chatId: string) => {
    setSelectedChat(chatId)
    // Marque les messages comme lus
    setChats(chats.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat)))
  }

  // Fonction pour envoyer un message
  const sendMessage = () => {
    if (!selectedChat || !newMessage.trim()) return // Vérifie si une conversation est sélectionnée et si le message n'est pas vide

    // Crée un nouvel objet message
    const newMessageObj = {
      id: `${selectedChat}-${Date.now()}`, // ✅ Fixed template literal syntax
      senderId: "guide", // Expéditeur (guide)
      senderName: "Guide", // Nom de l'expéditeur
      content: newMessage, // Contenu du message
      timestamp: new Date().toISOString(), // Horodatage
    }

    // Met à jour la liste des messages
    setMessages({
      ...messages,
      [selectedChat]: [...(messages[selectedChat as keyof typeof messages] || []), newMessageObj],
    })

    // Met à jour le dernier message dans la liste des conversations
    setChats(
      chats.map((chat) =>
        chat.id === selectedChat
          ? {
              ...chat,
              lastMessage: newMessage,
              lastMessageDate: new Date().toISOString(),
            }
          : chat,
      ),
    )

    setNewMessage("") // Réinitialise le champ de saisie
  }

  // Don't render dynamic content until after client-side hydration
  if (!isClient) {
    return null // Or return a loading state if you prefer
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
      {/* Carte pour la liste des conversations */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ChatList chats={chats} selectedChat={selectedChat} onSelectChat={selectChat} />
        </CardContent>
      </Card>

      {/* Carte pour la conversation sélectionnée */}
      <Card className="md:col-span-2">
        {selectedChat ? (
          <>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">{chats.find((chat) => chat.id === selectedChat)?.touristName}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[520px]">
              <MessageList messages={messages[selectedChat as keyof typeof messages] || []} />
              <div className="p-4 border-t">
                <MessageInput
                  newMessage={newMessage}
                  onNewMessageChange={setNewMessage}
                  onSendMessage={sendMessage}
                />
              </div>
            </CardContent>
          </>
        ) : (
          // Affiche un message si aucune conversation n'est sélectionnée
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Sélectionnez une conversation</h3>
              <p className="text-muted-foreground">Choisissez un touriste pour commencer à discuter</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
