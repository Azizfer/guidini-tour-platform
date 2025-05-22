"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, MessageSquare, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useChat, ChatUser } from "@/contexts/chat-context"

interface MessagePopoverProps {
  onViewAllMessages?: () => void
}

interface ProcessedConversation {
  user: ChatUser
  lastMessage: string
  timestamp: Date
  unread: boolean
}

export default function MessagePopover({ onViewAllMessages }: MessagePopoverProps) {
  const { openChat, unreadCount, closeChat, getUserById, users, conversations, refreshConversations, loadingConversations } = useChat()
  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [processedConversations, setProcessedConversations] = useState<ProcessedConversation[]>([]);
  
  // Function to prevent event propagation
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  };
  
  // Check if content is scrollable and update scroll state
  useEffect(() => {
    const checkScrollable = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = contentRef.current;
        setShowScrollButtons(scrollHeight > clientHeight);
        setMaxScroll(scrollHeight - clientHeight);
        setScrollPosition(scrollTop);
      }
    };
    
    checkScrollable();
    
    // Add resize observer to check when content changes
    const resizeObserver = new ResizeObserver(checkScrollable);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    
    return () => {
      if (contentRef.current) {
        resizeObserver.unobserve(contentRef.current);
      }
    };
  }, []);
  
  // Handle scroll events
  const handleScroll = () => {
    if (contentRef.current) {
      setScrollPosition(contentRef.current.scrollTop);
    }
  };
  
  // Scroll up function
  const scrollUp = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ top: -100, behavior: 'smooth' });
    }
  };
  
  // Scroll down function
  const scrollDown = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({ top: 100, behavior: 'smooth' });
    }
  };
  
  // Get current user ID from the JWT token
  const getCurrentUserId = (): string => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Simple JWT parsing
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        return payload._id || payload.userId || payload.id;
      }
    } catch (e) {
      console.error('Error getting current user ID:', e);
    }
    
    // Fallback to hardcoded ID if token parsing fails
    return "682e10803651e668c119fbaf";
  };
  
  const currentUserId = getCurrentUserId();
  
  // Process conversations to display in the popover
  useEffect(() => {
    const processConversationsData = async () => {
      if (!conversations || conversations.length === 0) return;
      
      const processed: ProcessedConversation[] = [];
      
      // Process each conversation
      for (const conversation of conversations) {
        try {
          // Find the other participant (not the current user)
          const otherParticipant = conversation.participants.find(
            (p: any) => p._id !== currentUserId
          );
          
          if (!otherParticipant) continue;
          
          // Get user data for the other participant
          const userData = await getUserById(otherParticipant._id);
          
          // Check if there's a last message
          let lastMessageContent = "No messages yet";
          let messageTimestamp = new Date();
          let isUnread = false;
          
          if (conversation.lastMessage) {
            // If the conversation has a lastMessage reference
            lastMessageContent = conversation.lastMessage.content || "";
            messageTimestamp = new Date(conversation.lastMessage.createdAt);
            
            // Check if the message is unread (current user is not in readBy array)
            isUnread = conversation.lastMessage.sender._id !== currentUserId && 
                      !conversation.lastMessage.readBy.includes(currentUserId);
          }
          
          processed.push({
            user: userData,
            lastMessage: lastMessageContent,
            timestamp: messageTimestamp,
            unread: isUnread
          });
        } catch (error) {
          console.error("Error processing conversation:", error);
        }
      }
      
      // Sort by timestamp (newest first)
      processed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setProcessedConversations(processed);
    };
    
    processConversationsData();
  }, [conversations, getUserById, currentUserId]);
  
  // Filter conversations based on search term
  const filteredConversations = processedConversations.filter(conv => 
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Today: show time
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffInDays < 7) {
      // This week: show day name
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Older: show date
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleMessageClick = (user: ChatUser) => {
    // Open the chat with the selected user
    openChat(user)
    
    // If there's a click handler for the popover, call it to close the popover
    const popoverTrigger = document.querySelector('[data-state="open"][role="dialog"]');
    if (popoverTrigger) {
      // Find the close button and click it
      const closeButton = popoverTrigger.querySelector('button[aria-label="Close"]');
      if (closeButton && closeButton instanceof HTMLElement) {
        closeButton.click();
      } else {
        // Fallback: add a click event to the document body to close any open popovers
        document.body.click();
      }
    }
  }

  return (
    <div 
      className="w-[350px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 absolute right-0"
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onMouseUp={stopPropagation}
      onTouchStart={stopPropagation}
      onTouchEnd={stopPropagation}
      onTouchMove={stopPropagation}
    >
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            Messages
            {loadingConversations && (
              <span className="ml-2">
                <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
              </span>
            )}
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

      <div 
        ref={contentRef}
        className="max-h-[350px] overflow-y-auto" 
        id="message-scroll-area"
        onScroll={handleScroll}
      >
        {filteredConversations.length > 0 ? (
          <div className="p-2">
            {filteredConversations.map((conversation) => {
              const formattedTime = new Intl.DateTimeFormat('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              }).format(conversation.timestamp);
              
              return (
                <motion.div
                  key={conversation.user.id}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "relative bg-white border rounded-lg p-2 mb-2 cursor-pointer",
                    conversation.unread ? "border-gray-200 bg-gray-50" : "border-gray-100",
                  )}
                  onClick={() => handleMessageClick(conversation.user)}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8 shrink-0">
                      <img
                        src={conversation.user.avatar || "/placeholder.svg"}
                        alt={conversation.user.name}
                        className="rounded-full object-cover h-8 w-8"
                      />
                      {conversation.user.online && (
                        <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={cn("text-sm font-medium", conversation.unread ? "text-gray-900" : "text-gray-700")}>
                          {conversation.user.name}
                        </p>
                        <span className="text-xs text-gray-400">{formattedTime}</span>
                      </div>
                      <p
                        className={cn(
                          "text-[12px] mt-0.5 line-clamp-2",
                          conversation.unread ? "text-gray-700" : "text-gray-500",
                        )}
                      >
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>

                  {conversation.unread && <div className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-blue-500" />}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="flex justify-center mb-2">
              <MessageSquare className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm">Aucun message trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
