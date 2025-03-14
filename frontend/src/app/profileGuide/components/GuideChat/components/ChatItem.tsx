import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatItemProps {
  chat: {
    id: string
    touristName: string
    touristAvatar: string
    lastMessage: string
    lastMessageDate: string
    unreadCount: number
  }
  isSelected: boolean
  onSelectChat: (chatId: string) => void
}

export default function ChatItem({ chat, isSelected, onSelectChat }: ChatItemProps) {
  return (
    <div
      key={chat.id}
      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
        isSelected ? "bg-muted" : ""
      }`}
      onClick={() => onSelectChat(chat.id)}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={chat.touristAvatar} alt={chat.touristName} />
          <AvatarFallback>{chat.touristName.substring(0, 2)}</AvatarFallback>
        </Avatar>
        {chat.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {chat.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="font-medium truncate">{chat.touristName}</h3>
          <span className="text-xs text-muted-foreground">
            {new Date(chat.lastMessageDate).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
      </div>
    </div>
  )
}