// Props pour le composant MessageItem
interface MessageItemProps {
    message: {
      id: string
      senderId: string
      senderName: string
      content: string
      timestamp: string
    }
  }
  
  // Composant MessageItem
  export default function MessageItem({ message }: MessageItemProps) {
    const isGuide = message.senderId === "guide" // Vérifie si l'expéditeur est le guide
  
    return (
      // Conteneur pour un message (aligné à gauche ou à droite selon l'expéditeur)
      <div className={`flex ${isGuide ? "justify-end" : "justify-start"}`}>
        {/* Bulle de message */}
        <div
          className={`max-w-[80%] rounded-lg p-3 ${
            isGuide ? "bg-primary text-primary-foreground" : "bg-muted" // Style différent pour le guide et le touriste
          }`}
        >
          <p>{message.content}</p> {/* Contenu du message */}
          {/* Horodatage du message */}
          <p
            className={`text-xs mt-1 ${
              isGuide ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    )
  }