"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Define types for chat functionality
export interface ChatUser {
  id: string
  name: string
  avatar?: string
  online?: boolean
}

export interface Message {
  _id: string
  content: string
  sender: {
    _id: string
    name?: string
    profileImage?: string
    username?: string
  }
  conversation: string
  readBy: string[]
  createdAt: string | Date
}

interface ChatContextType {
  messages: Message[]
  conversations: any[]
  activeChat: ChatUser | null
  isChatOpen: boolean
  isChatBubbleOpen: boolean
  unreadCount: number
  users: Record<string, ChatUser>
  getUserById: (userId: string) => Promise<ChatUser>
  sendMessage: (content: string, receiverId: string) => Promise<void>
  openChat: (user: ChatUser) => void
  closeChat: () => void
  minimizeChat: () => void
  maximizeChat: () => void
  toggleChatBubble: () => void
  refreshConversations: () => Promise<void>
  loadingConversations: boolean
  loadingMessages: boolean
  error: string | null
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChat, setActiveChat] = useState<ChatUser | null>(null)
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isChatBubbleOpen, setIsChatBubbleOpen] = useState(false)
  const [users, setUsers] = useState<Record<string, ChatUser>>({})
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get current user ID from JWT token
  const getCurrentUserId = () => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return null;
      }

      const token = localStorage.getItem('token')
      if (!token) {
        return null;
      }
      
      // Parse JWT token
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return null;
      }
      
      const base64Url = tokenParts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      
      try {
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        
        const payload = JSON.parse(jsonPayload)
        const userId = payload.id || payload.userId || payload._id;
        
        if (!userId) {
          return null;
        }
        
        return userId;
      } catch (decodeError) {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  const currentUserId = getCurrentUserId()

  // Calculate unread message count
  const unreadCount = conversations.reduce((count, conv) => {
    if (!currentUserId) return count;
    
    if (conv.lastMessage && 
        conv.lastMessage.sender && 
        conv.lastMessage.sender._id !== currentUserId && 
        conv.lastMessage.readBy && 
        !conv.lastMessage.readBy.includes(currentUserId)) {
      return count + 1
    }
    return count
  }, 0)

  // Get user details by ID
  const getUserById = async (userId: string): Promise<ChatUser> => {
    if (users[userId]) {
      return users[userId]
    }
    
    try {
      // Use the fixed API endpoint on port 5002 for testing
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      console.log('Fetching user data from fixed API endpoint:', `${apiUrl}/api/users/guides/${userId}`);
      const response = await fetch(`${apiUrl}/api/users/guides/${userId}`)
      
      if (response.ok) {
        const userData = await response.json()
        const user = {
          id: userId,
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username,
          avatar: userData.profileImage,
          online: false
        }
        
        setUsers(prev => ({
          ...prev,
          [userId]: user
        }))
        
        return user
      } else {
        throw new Error(`Failed to fetch user data: ${response.status}`)
      }
    } catch (error) {
      // Return a basic user object if we can't fetch the real data
      const user = {
        id: userId,
        name: "User",
        avatar: undefined,
        online: false
      }
      
      setUsers(prev => ({
        ...prev,
        [userId]: user
      }))
      
      return user
    }
  }

  // Fetch all conversations for the current user
  const fetchConversations = async () => {
    try {
      // Check if we have a valid token and user ID
      const token = localStorage.getItem('token')
      if (!token || !currentUserId) {
        setError('Authentification requise pour charger les conversations')
        setConversations([])
        setLoadingConversations(false)
        return
      }
      
      setLoadingConversations(true)
      setError(null)
      
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/messages/conversations`, {
        headers
      })
      
      
      if (response.ok) {
        const data = await response.json()

        setConversations(data || [])
        
        // Load user details for all participants
        const userIds = new Set<string>()
        if (data && data.length > 0) {
          data.forEach((conversation: any) => {
            if (conversation.participants) {
              conversation.participants.forEach((participant: any) => {
                if (participant && participant._id && participant._id !== currentUserId) {
                  userIds.add(participant._id)
                }
              })
            }
          })
          

          const userPromises = Array.from(userIds).map(id => getUserById(id))
          await Promise.all(userPromises)
        }
      } else {
        // Try to parse the error response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Unknown error', code: 'UNKNOWN' };
        }
        
        // Keep existing conversations instead of clearing them on error
        // This provides a better user experience when there are network issues
        
        // Handle token expiration specifically
        if (response.status === 401) {
          if (errorData.code === 'TOKEN_EXPIRED') {
            // Token expired - clear token and notify user
            localStorage.removeItem('token');
            setError('Votre session a expiré. Veuillez vous reconnecter.');
          } else {
            // Other auth error
            setError('Authentification requise. Veuillez vous reconnecter.');
          }
        } else {
          // Other server error
          setError(`Impossible de charger les conversations: ${errorData.message || response.status}`);
        }
      }
    } catch (error) {
      // Keep existing conversations instead of clearing them on error
      setError('Impossible de se connecter au service de chat')
    } finally {
      setLoadingConversations(false)
    }
  }

  // Refresh conversations list
  const refreshConversations = async () => {
    // Only fetch if we're not already loading conversations
    if (!loadingConversations) {
      await fetchConversations()
    }
  }
  
  // Fetch messages for a specific conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/messages/conversation/${conversationId}`, {
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data || [])
      } else {
        // Try to parse the error response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Unknown error', code: 'UNKNOWN' };
        }
        
        setMessages([])
        
        // Handle token expiration specifically
        if (response.status === 401) {
          if (errorData.code === 'TOKEN_EXPIRED') {
            // Token expired - clear token and notify user
            localStorage.removeItem('token');
            setError('Votre session a expiré. Veuillez vous reconnecter.');
          } else {
            // Other auth error
            setError('Authentification requise. Veuillez vous reconnecter.');
          }
        } else {
          // Other server error
          setError(`Impossible de charger les messages: ${errorData.message || response.status}`);
        }
      }
    } catch (error) {
      setMessages([])
      setError('Unable to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }

  // Send a new message
  const sendMessage = async (content: string, recipientId: string) => {
    if (!content.trim()) return
    
    try {
      console.log('🔵 Sending message:', { content, recipientId })
      setLoadingMessages(true)
      setError(null)
      
      // Check if we have a valid token and user ID
      const token = localStorage.getItem('token')
      console.log('🔑 Token exists:', !!token)
      
      if (!token || !currentUserId) {
        console.error('❌ Authentication required - missing token or user ID')
        setError('Authentification requise pour envoyer des messages')
        setLoadingMessages(false)
        return
      }
      
      console.log('👤 Current user ID:', currentUserId)
      
      // Create a temporary message to show immediately in the UI
      const tempId = `temp-${Date.now()}`
      const tempMessage: Message = {
        _id: tempId,
        content,
        sender: {
          _id: currentUserId,
          name: 'You',
          profileImage: undefined,
          username: 'current-user'
        },
        conversation: activeConversation || '',
        readBy: [currentUserId],
        createdAt: new Date().toISOString()
      }
      
      // Add temporary message to the UI immediately
      setMessages(prev => [
        ...prev, 
        tempMessage
      ])
      
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      // Try to send to backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const endpoint = `${apiUrl}/api/messages/send`;
      console.log('🔗 Sending message to API endpoint:', endpoint);
      console.log('💬 Message payload:', { recipientId, content });
      console.log('🔑 Request headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer [token-hidden]' : 'none' });
      
      let response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            recipientId,
            content
          })
        });
        console.log('💯 API response status:', response.status);
      } catch (error) {
        const fetchError = error as Error;
        console.error('❌ Fetch error:', fetchError);
        setError(`Network error: ${fetchError.message}`);
        setLoadingMessages(false);
        return;
      }
      
      if (!response.ok) {
        // Try to parse the error response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Unknown error', code: 'UNKNOWN' };
        }
        
        // Handle token expiration specifically
        if (response.status === 401) {
          if (errorData.code === 'TOKEN_EXPIRED') {
            // Token expired - clear token and notify user
            localStorage.removeItem('token');
            setError('Votre session a expiré. Veuillez vous reconnecter.');
          } else {
            // Other auth error
            setError('Authentification requise. Veuillez vous reconnecter.');
          }
        } else {
          // Other server error
          setError(`Message affiché localement uniquement. Erreur: ${errorData.message || response.status}`);
        }
        return;
      }
      
      // Message successfully stored in database
      let data;
      try {
        data = await response.json();
        console.log('✅ Message saved to database successfully:', data);
      } catch (error) {
        console.error('❌ Error parsing response JSON:', error);
        setError('Error processing server response');
        setLoadingMessages(false);
        return;
      }
      
      // Replace the temporary message with the real one from the database
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? data : msg
      ))
      
      // Refresh conversations to update the list with the new message
      try {
        await refreshConversations()
      } catch (refreshError) {
        // Silent fail - we still sent the message successfully
      }
      
    } catch (error) {
      // Keep the message visible in UI even if saving failed
      console.error('❌ Error in sendMessage:', error);
      setError('Message shown locally only. Could not save to database.')
    } finally {
      setLoadingMessages(false)
      console.log('ℹ️ Message sending process completed');
    }
  }

  // Open a chat with a specific user
  const openChat = async (user: ChatUser) => {
    setActiveChat(user)
    setIsChatOpen(true)
    setIsChatBubbleOpen(false)
    setError(null)
    
    // Check if we already have a conversation with this user
    if (conversations.length === 0) {
      await refreshConversations()
    }
    
    const existingConversation = conversations.find((conv: any) => {
      return conv.participants && conv.participants.some((p: any) => p._id === user.id)
    })
    
    if (existingConversation) {
      setActiveConversation(existingConversation._id)
      await fetchMessages(existingConversation._id)
    } else {
      // No existing conversation, create a new one by sending the first message
      setActiveConversation(null)
      setMessages([])
    }
  }

  // Close the chat window
  const closeChat = () => {
    setIsChatOpen(false)
  }

  // Minimize the chat window
  const minimizeChat = () => {
    setIsChatOpen(false)
    setIsChatBubbleOpen(true)
  }

  // Maximize the chat window
  const maximizeChat = () => {
    setIsChatOpen(true)
    setIsChatBubbleOpen(false)
  }

  // Toggle the chat bubble visibility
  const toggleChatBubble = () => {
    setIsChatBubbleOpen(prev => !prev)
  }

  // Load conversations when the component mounts
  useEffect(() => {
    let isMounted = true;
    
    if (currentUserId && isMounted) {
      // Use a function to fetch data to avoid dependency issues
      const loadInitialData = async () => {
        setLoadingConversations(true);
        try {
          await fetchConversations();
        } finally {
          if (isMounted) setLoadingConversations(false);
        }
      };
      
      loadInitialData();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [currentUserId]) // fetchConversations is intentionally omitted from dependencies

  // Context value
  const value = {
    messages,
    conversations,
    activeChat,
    isChatOpen,
    isChatBubbleOpen,
    unreadCount,
    users,
    getUserById,
    sendMessage,
    openChat,
    closeChat,
    minimizeChat,
    maximizeChat,
    toggleChatBubble,
    refreshConversations,
    loadingConversations,
    loadingMessages,
    error
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

// Hook to use the chat context
export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
