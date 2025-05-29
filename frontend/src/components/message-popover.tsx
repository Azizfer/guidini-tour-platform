"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, ChevronUp, ChevronDown, Search, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useChat, ChatUser } from "../contexts/chat-context"

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
  const stopPropagation = (e: React.MouseEvent | React.TouchEvent | React.FocusEvent) => {
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
  
  // Get current user ID from JWT token
  const getCurrentUserId = (): string | null => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.warn('Not in browser environment');
        return null;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found in localStorage');
        return null;
      }
      
      // Parse JWT token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      return payload.id || payload.userId || payload._id || "6460f087d0509a5a2e4c36a9"; // Fallback test user ID
    } catch (error) {
      return "6460f087d0509a5a2e4c36a9"; // Fallback test user ID
    }
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
  
  // Refresh conversations when the popover is opened
  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshConversations();
      } catch (error) {
        // Silent fail - UI will show empty state
      }
    };
    
    fetchData();
    
    // Set up an interval to refresh conversations periodically
    const refreshInterval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [refreshConversations]);
  
  // Simple filtering logic for conversations based on search term
  const filteredConversations = processedConversations.filter(conversation => {
    if (!searchTerm || searchTerm.trim() === "") return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameLower = conversation.user.name.toLowerCase();
    const messageLower = conversation.lastMessage.toLowerCase();
    
    return nameLower.includes(searchLower) || messageLower.includes(searchLower);
  });

  // Handle message click
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

  // Create a custom event for closing message popovers
  useEffect(() => {
    // Listen for the custom event to close this popover
    const handleCloseMessagePopover = () => {
      // Find and click any close buttons in the current component
      const closeButtons = document.querySelectorAll('[data-popover-close]');
      closeButtons.forEach(button => {
        if (button instanceof HTMLElement) {
          button.click();
        }
      });
      
      // Dispatch Escape key as fallback
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true
      }));
    };
    
    // Add event listener
    window.addEventListener('closeMessagePopover', handleCloseMessagePopover);
    
    // Clean up
    return () => {
      window.removeEventListener('closeMessagePopover', handleCloseMessagePopover);
    };
  }, []);
  
  const handleMessageClick = (user: ChatUser) => {
    // Open the chat with the selected user but don't navigate
    openChat(user);
    
    // Create and dispatch a custom event specifically for the Header component
    // This is a direct communication method to tell the Header to close the popover
    const forceCloseEvent = new CustomEvent('forceCloseMessagePopover', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(forceCloseEvent);
    
    // Also call the onViewAllMessages prop if available
    if (onViewAllMessages) {
      onViewAllMessages();
      return; // Exit early if we successfully called the parent function
    }
    
    // We'll avoid using fallback methods that might affect other popovers
    // and only use the custom event which has been updated to be safe
  }

  return (
    <div 
      className="w-[350px] bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 absolute right-0 z-50 message-popover-container"
    >
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Messages
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-0.5 font-medium">{unreadCount}</span>
            )}
          </h3>
        </div>
        {/* Search field with NotificationCard styling */}
        <div className="mt-2">
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white transition-all duration-200 hover:border-blue-300 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-200">
            <div className="px-2">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 py-1.5 px-1 text-sm border-0 focus:outline-none focus:ring-0"
            />
            {searchTerm && (
              <button 
                type="button"
                onClick={() => setSearchTerm('')}
                className="px-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div 
        ref={contentRef}
        className="max-h-[350px] overflow-y-auto" 
        id="message-scroll-area"
        onScroll={handleScroll}
      >
        {filteredConversations.length > 0 ? (
          <div>
            {searchTerm && (
              <div className="text-xs text-gray-500 px-4 py-2 border-b border-gray-100">
                {filteredConversations.length} résultat{filteredConversations.length > 1 ? 's' : ''} trouvé{filteredConversations.length > 1 ? 's' : ''}
              </div>
            )}
            {filteredConversations.map((conversation) => {
              const formattedTime = formatTimestamp(conversation.timestamp);
              
              // Get accent color based on read status
              const getAccentColor = () => {
                return conversation.unread ? "border-blue-500" : "border-gray-300";
              };
              
              return (
                <motion.div
                  key={conversation.user.id}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "px-4 py-3 border-b border-gray-100 last:border-0 transition-all duration-200 cursor-pointer",
                    conversation.unread ? "" : "hover:bg-gray-50"
                  )}
                  onClick={() => handleMessageClick(conversation.user)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img
                          src={conversation.user.avatar || "/placeholder.svg"}
                          alt={conversation.user.name}
                          className={cn(
                            "h-10 w-10 rounded-full object-cover border-2",
                            getAccentColor()
                          )}
                        />
                        {conversation.unread && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full border border-white"></span>
                        )}
                        {conversation.user.online && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border border-white"></span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">{conversation.user.name}</h4>
                        <div className="flex items-center text-xs text-gray-500 whitespace-nowrap ml-2">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formattedTime}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <div className="flex justify-center mb-2">
              {searchTerm ? (
                <Search className="h-6 w-6 text-gray-300" />
              ) : (
                <MessageSquare className="h-6 w-6 text-blue-300" />
              )}
            </div>
            {searchTerm ? (
              <>
                <p className="text-sm font-medium">Aucun résultat pour "{searchTerm}"</p>
                <p className="text-xs mt-1">Essayez avec d'autres termes de recherche</p>
              </>
            ) : (
              <p className="text-sm">Aucun message trouvé</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
