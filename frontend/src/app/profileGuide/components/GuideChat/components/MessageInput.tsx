import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

// Props pour le composant MessageInput
interface MessageInputProps {
  newMessage: string // Contenu du nouveau message
  onNewMessageChange: (value: string) => void // Fonction pour mettre à jour le nouveau message
  onSendMessage: () => void // Fonction pour envoyer le message
}

// Composant MessageInput
export default function MessageInput({ newMessage, onNewMessageChange, onSendMessage }: MessageInputProps) {
  return (
    // Formulaire pour envoyer un message
    <form
      onSubmit={(e) => {
        e.preventDefault() // Empêche le rechargement de la page
        onSendMessage() // Envoie le message
      }}
      className="flex gap-2"
    >
      {/* Champ de saisie pour le message */}
      <Input
        placeholder="Tapez votre message..."
        value={newMessage}
        onChange={(e) => onNewMessageChange(e.target.value)} // Met à jour le message en temps réel
      />
      {/* Bouton pour envoyer le message */}
      <Button type="submit" size="icon">
        <Send className="h-4 w-4" /> {/* Icône d'envoi */}
      </Button>
    </form>
  )
}