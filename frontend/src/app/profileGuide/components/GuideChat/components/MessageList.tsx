import { ScrollArea } from "@/components/ui/scroll-area"
import MessageItem from "./MessageItem"

// Définition des types pour les messages
interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
}

// Props pour le composant MessageList
interface MessageListProps {
  messages: Message[] // Liste des messages
}

// Composant MessageList
export default function MessageList({ messages }: MessageListProps) {
  return (
    // Zone de défilement pour la liste des messages
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {/* Boucle sur chaque message pour afficher un MessageItem */}
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} /> /* Composant pour un message individuel */
        ))}
      </div>
    </ScrollArea>
  )
}