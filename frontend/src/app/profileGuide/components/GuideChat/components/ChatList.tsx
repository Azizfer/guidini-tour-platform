import { ScrollArea } from "@/components/ui/scroll-area"
import ChatItem from "./ChatItem"

// Définition des types pour les données de chat
interface Chat {
  id: string
  touristId: string
  touristName: string
  touristAvatar: string
  lastMessage: string
  lastMessageDate: string
  unreadCount: number
}

// Props pour le composant ChatList
interface ChatListProps {
  chats: Chat[] // Liste des conversations
  selectedChat: string | null // ID de la conversation sélectionnée
  onSelectChat: (chatId: string) => void // Fonction pour sélectionner une conversation
}

// Composant ChatList
export default function ChatList({ chats, selectedChat, onSelectChat }: ChatListProps) {
  // Handle case if chats is empty or undefined
  if (!chats || chats.length === 0) {
    return <div>No conversations available</div> // You can customize this message
  }

  return (
    // Zone de défilement pour la liste des conversations
    <ScrollArea className="h-[520px]">
      {/* Boucle sur chaque conversation pour afficher un ChatItem */}
      {chats.map((chat) => (
        <ChatItem
          key={chat.id} // Clé unique pour React
          chat={chat} // Données de la conversation
          isSelected={selectedChat === chat.id} // Vérifie si la conversation est sélectionnée
          onSelectChat={onSelectChat} // Fonction pour sélectionner la conversation
        />
      ))}
    </ScrollArea>
  )
}