"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import messageService, { Conversation } from "@/services/messageService"
import { User } from "@/services/userService"
import axios from "axios"

// Import custom scrollbar styles
import "@/components/notifications/scrollbar.css"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  lastMessage: string
  timestamp: string
  isRead: boolean
  isOnline: boolean
  unreadCount: number
}

// Helper to get API URL
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

// Define interfaces for API responses
interface UserApiResponse {
  _id: string;
  id?: string;
  name: string;
  email: string;
  userType?: string;
  role?: string;
  profilePicture?: string;
  profileImage?: string;
}

interface GuideApiResponse {
  _id: string;
  id?: string;
  name: string;
  email: string;
  userType?: string;
  profileImage?: string;
  avatar?: string;
}

// Function to directly fetch user data from API
const fetchUserData = async (userId: string | object): Promise<User | null> => {
  try {
    // Ensure userId is a string
    let userIdStr: string;
    if (typeof userId === 'object') {
      // If it's an object, try to extract the ID
      if (userId && (userId as any)._id) {
        userIdStr = (userId as any)._id;
      } else if (userId && (userId as any).id) {
        userIdStr = (userId as any).id;
      } else {
        console.error('Invalid userId object');
        return null;
      }
    } else {
      userIdStr = userId;
    }
    
    // Validate that we have a proper ID string
    if (!userIdStr || typeof userIdStr !== 'string') {
      console.error('Invalid userId format:', userIdStr);
      return null;
    }
    
    // Try user endpoint first
    try {
      const userResponse = await axios.get<UserApiResponse>(`${getApiUrl()}/api/users/${userIdStr}`, {
        headers: getAuthHeaders()
      });
      
      if (userResponse.data && userResponse.data.name) {
        return {
          id: userResponse.data._id,
          _id: userResponse.data._id,
          name: userResponse.data.name,
          email: userResponse.data.email,
          role: userResponse.data.userType || userResponse.data.role || 'user',
          profilePicture: userResponse.data.profilePicture || userResponse.data.profileImage
        };
      }
    } catch (userError) {
      // Silent fail, will try guide API next
    }
    
    // Try guide endpoint if user endpoint fails
    try {
      const guideResponse = await axios.get<GuideApiResponse>(`${getApiUrl()}/api/users/guides/${userIdStr}`, {
        headers: getAuthHeaders()
      });
      
      if (guideResponse.data && guideResponse.data.name) {
        return {
          id: guideResponse.data._id || userIdStr,
          _id: guideResponse.data._id || userIdStr,
          name: guideResponse.data.name,
          email: guideResponse.data.email || '',
          role: 'guide',
          profilePicture: guideResponse.data.profileImage || guideResponse.data.avatar
        };
      }
    } catch (guideError) {
      // Silent fail
    }
    
    // Return null if no user data found
    return null;
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    return null;
  }
};

// Function to format conversation data to Message interface
const formatConversationToMessage = async (conversation: Conversation): Promise<Message> => {
  try {
    if (!conversation || typeof conversation !== 'object') {
      console.error('Invalid conversation object:', conversation);
      throw new Error('Invalid conversation format');
    }

    // Get current user from localStorage to determine the other participant
    let currentUserId = '';
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const currentUser = JSON.parse(userJson);
        currentUserId = currentUser?._id || '';
      }
    } catch (parseError) {
      console.error('Error parsing user from localStorage:', parseError);
    }
    
    // Safely access participants array
    const participants = Array.isArray(conversation.participants) ? conversation.participants : [];
    
    // Find the other participant (not the current user)
    let otherParticipantId = 'unknown';
    if (participants.length > 0) {
      // Find the first participant that isn't the current user
      const otherParticipant = participants.find(id => id !== currentUserId);
      
      // Ensure we have a string ID, not an object
      if (otherParticipant) {
        if (typeof otherParticipant === 'object') {
          // Extract ID from object if needed
          otherParticipantId = (otherParticipant as any)._id || (otherParticipant as any).id || 'unknown';
        } else {
          otherParticipantId = otherParticipant;
        }
      } else {
        // If all participants are the current user or we can't find another, use the first one
        const firstParticipant = participants[0];
        if (typeof firstParticipant === 'object') {
          otherParticipantId = (firstParticipant as any)._id || (firstParticipant as any).id || 'unknown';
        } else {
          otherParticipantId = firstParticipant;
        }
      }
    }
    
    // Fetch real user data for the other participant directly from API
    let userData: User | null = null;
    try {
      userData = await fetchUserData(otherParticipantId);
    } catch (error) {
      // Silent fail with null userData
    }
    
    // Use the fetched user data or fallback to ID if not available
    const senderName = userData?.name || `Utilisateur ${otherParticipantId.substring(0, 5)}`;
    const senderAvatar = userData?.profilePicture;
    
    // Safely handle dates
    let timestamp = 'À l\'instant';
    if (conversation.updatedAt) {
      try {
        timestamp = formatTimestamp(new Date(conversation.updatedAt));
      } catch (dateError) {
        console.error('Error formatting timestamp:', dateError);
      }
    }
    
    // Safely handle lastMessage
    const lastMessage = conversation.lastMessage?.content || 'Nouvelle conversation';
    const isRead = conversation.lastMessage?.read === false ? false : true;
    const unreadCount = isRead ? 0 : 1;
    
    return {
      id: conversation._id || `temp-${Date.now()}`,
      senderId: otherParticipantId,
      senderName: senderName,
      senderAvatar: senderAvatar,
      lastMessage: lastMessage,
      timestamp: timestamp,
      isRead: isRead,
      isOnline: false, // Would need a separate online status service
      unreadCount: unreadCount
    };
  } catch (error) {
    console.error('Error formatting conversation to message:', error);
    // Return a fallback message object
    return {
      id: `error-${Date.now()}`,
      senderId: 'error',
      senderName: 'Erreur de chargement',
      senderAvatar: '',
      lastMessage: 'Impossible de charger cette conversation',
      timestamp: 'À l\'instant',
      isRead: true,
      isOnline: false,
      unreadCount: 0
    };
  }
};

// Helper function to format timestamps
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  if (diffInMinutes < 24 * 60) {
    const hours = Math.floor(diffInMinutes / 60);
    return `Il y a ${hours} h`;
  }
  if (diffInMinutes < 48 * 60) return 'Hier';
  
  const days = Math.floor(diffInMinutes / (60 * 24));
  if (days < 7) return `Il y a ${days} jours`;
  
  return messageDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

interface MessagePopoverProps {
  messages?: Message[]
  onOpenChat?: (message: Message) => void
}

// Sample data for development and testing
const initialMessages: Message[] = [
  {
    id: 'msg1',
    senderId: 'user1',
    senderName: 'Ahmed Benali',
    senderAvatar: '/images/guides/ahmed.jpg',
    lastMessage: 'Bonjour, je suis intéressé par votre visite guidée à Sidi Bou Said.',
    timestamp: '10:30',
    isRead: false,
    isOnline: true,
    unreadCount: 1
  },
  {
    id: 'msg2',
    senderId: 'user2',
    senderName: 'Leila Trabelsi',
    senderAvatar: '/images/guides/leila.jpg',
    lastMessage: 'Merci pour votre réservation. Je vous confirme la visite pour demain à 14h.',
    timestamp: 'Hier',
    isRead: true,
    isOnline: false,
    unreadCount: 0
  },
  {
    id: 'msg3',
    senderId: 'user3',
    senderName: 'Karim Mejri',
    senderAvatar: '/images/guides/karim.jpg',
    lastMessage: 'Pouvez-vous me donner plus de détails sur le circuit de Carthage?',
    timestamp: 'Lun',
    isRead: true,
    isOnline: true,
    unreadCount: 0
  }
]

export default function MessagePopover({ onOpenChat }: { onOpenChat?: (message: Message) => void }) {
  const [messageList, setMessageList] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState("")
  // Filter messages based on search query
  const filteredMessages = messageList.filter(message => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      message.senderName.toLowerCase().includes(searchLower) ||
      message.lastMessage?.toLowerCase().includes(searchLower)
    );
  });
  
  const totalUnreadCount = messageList.reduce((sum, msg) => sum + msg.unreadCount, 0)
  
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const conversations = await messageService.getUserConversations();
        
        if (conversations && conversations.length > 0) {
          try {
            // Process each conversation with user data in parallel
            const formattedMessagesPromises = conversations.map(formatConversationToMessage);
            const formattedMessages = await Promise.all(formattedMessagesPromises);
            setMessageList(formattedMessages);
          } catch (formatError) {
            setError('Erreur lors du formatage des conversations');
          }
        } else {
          // Set empty list but don't show error
          setMessageList([]);
        }
      } catch (err: any) {
        // Set generic error message
        let errorMessage = 'Impossible de charger les messages';
        if (err.response && err.response.status) {
          errorMessage += ` (${err.response.status})`;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, []);

  const markAsRead = (id: string) => {
    setMessageList((prev) =>
      prev.map((message) => (message.id === id ? { ...message, isRead: true, unreadCount: 0 } : message)),
    )
  }

  const handleMessageClick = (message: Message) => {
    markAsRead(message.id)
    if (onOpenChat) {
      onOpenChat(message)
    }
  }

  return (
    <motion.div
      className="w-80 overflow-hidden rounded-2xl shadow-xl border border-gray-100 bg-white"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Header section */}
      <div className="p-3 bg-gradient-to-br from-blue-50 to-amber-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 text-gray-700 hover:bg-gray-200 transition-colors self-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-bold text-gray-900 text-sm">Messages</h3>
              {totalUnreadCount > 0 && (
                <p className="text-xs text-green-600">
                  {totalUnreadCount} non lu{totalUnreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          {/* 'Voir tout' link removed */}
        </div>
      </div>

      {/* Search field */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-md py-1.5 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
      </div>

      {/* Messages list */}
      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-6 text-center">
            <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center animate-pulse">
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Chargement des messages...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="p-3 bg-red-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : filteredMessages.length === 0 && searchQuery ? (
          <div className="p-6 text-center">
            <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Aucun message ne correspond à votre recherche</p>
          </div>
        ) : messageList.length === 0 ? (
          <div className="p-6 text-center">
            <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Aucun message</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer group border-l-2",
                  !message.isRead ? "border-l-green-500 bg-green-50/30" : "border-l-transparent",
                )}
                onClick={() => handleMessageClick(message)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-8 w-8 border border-gray-200">
                      <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                        {message.senderName && typeof message.senderName === 'string' && message.senderName.length > 0 
                          ? message.senderName.charAt(0).toUpperCase() 
                          : '?'}
                      </AvatarFallback>
                    </Avatar>
                    {message.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 border border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={cn(
                          "text-xs truncate",
                          !message.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700",
                        )}
                      >
                        {message.senderName}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                        {message.unreadCount > 0 && (
                          <div className="bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                            {message.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className={cn("text-xs line-clamp-2", !message.isRead ? "text-gray-800" : "text-gray-600")}>
                      {message.lastMessage}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer removed */}
    </motion.div>
  )
}
