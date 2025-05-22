"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

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
  
  const currentUserId = "682e10803651e668c119fbaf" // Hardcoded user ID for development

  const unreadCount = conversations.reduce((count, conv) => {
    if (conv.lastMessage && 
        conv.lastMessage.sender._id !== currentUserId && 
        !conv.lastMessage.readBy.includes(currentUserId)) {
      return count + 1
    }
    return count
  }, 0)

  const getUserById = async (userId: string): Promise<ChatUser> => {
    if (users[userId]) {
      return users[userId]
    }
    
    try {
      const response = await fetch(`http://localhost:5001/api/users/guides/${userId}`)
      
      if (response.ok) {
        const userData = await response.json()
        const user = {
          id: userId,
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username,
          avatar: userData.profileImage || `/placeholder.svg?height=40&width=40&text=${(userData.name || userData.username || '?').charAt(0).toUpperCase()}`,
          online: false
        }
        
        setUsers(prev => ({
          ...prev,
          [userId]: user
        }))
        
        return user
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
    
    const knownUsers: Record<string, { name: string, initials: string }> = {
      "682e10803651e668c119fbaf": { name: "Aziz Ferchichi", initials: "AF" },
      "682e15ae0f8b060923637173": { name: "Guide Touristique", initials: "GT" }
    }
    
    if (knownUsers[userId]) {
      const user = {
        id: userId,
        name: knownUsers[userId].name,
        avatar: `/placeholder.svg?height=40&width=40&text=${knownUsers[userId].initials}`,
        online: true
      }
      
      setUsers(prev => ({
        ...prev,
        [userId]: user
      }))
      
      return user
    }
    
    const nameHash = userId.substring(0, 6)
    const names = [
      'John', 'Jane', 'Alex', 'Sarah', 'Mohammed', 'Fatima', 'Carlos', 'Maria',
      'Hiroshi', 'Yuki', 'Chen', 'Li', 'Raj', 'Priya', 'Olga', 'Dmitri'
    ]
    const surnames = [
      'Smith', 'Johnson', 'Garcia', 'Chen', 'Patel', 'Sato', 'Kim', 'Ivanov',
      'Müller', 'Silva', 'Okafor', 'Nguyen', 'Ali', 'Kowalski', 'Rossi', 'Singh'
    ]
    
    const nameIndex = parseInt(nameHash.substring(0, 2), 16) % names.length
    const surnameIndex = parseInt(nameHash.substring(2, 4), 16) % surnames.length
    const name = `${names[nameIndex]} ${surnames[surnameIndex]}`
    const initials = `${names[nameIndex].charAt(0)}${surnames[surnameIndex].charAt(0)}`
    
    const user = {
      id: userId,
      name: name,
      avatar: `/placeholder.svg?height=40&width=40&text=${initials}`,
      online: parseInt(nameHash.substring(4, 6), 16) % 2 === 0
    }
    
    setUsers(prev => ({
      ...prev,
      [userId]: user
    }))
    
    return user
  }

  const fetchConversations = async () => {
    console.log('Fetching conversations for user:', currentUserId)
    try {
      setLoadingConversations(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('http://localhost:5001/api/messages/conversations', {
        headers
      })
      
      console.log('Conversations API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Conversations received:', data)
        setConversations(data || [])
        
        const userIds = new Set<string>()
        if (data && data.length > 0) {
          data.forEach((conversation: any) => {
            console.log('Processing conversation:', conversation._id)
            if (conversation.participants) {
              conversation.participants.forEach((participant: any) => {
                if (participant && participant._id && participant._id !== currentUserId) {
                  console.log('Adding participant to fetch:', participant._id, participant.name || 'Unknown')
                  userIds.add(participant._id)
                }
              })
            }
          })
          
          console.log('User IDs to fetch:', Array.from(userIds))
          const userPromises = Array.from(userIds).map(id => getUserById(id))
          await Promise.all(userPromises)
        }
      } else {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`Failed to fetch conversations: ${response.status} - ${errorText}`)
        setConversations([])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations([])
    } finally {
      setLoadingConversations(false)
    }
  }

  const refreshConversations = async () => {
    await fetchConversations()
  }
  
  const fetchMessages = async (conversationId: string) => {
    console.log('Fetching messages for conversation:', conversationId)
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
      
      const response = await fetch(`http://localhost:5001/api/messages/conversation/${conversationId}`, {
        headers
      })
      
      console.log('Messages API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Messages received:', data)
        setMessages(data || [])
      } else {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`Failed to fetch messages: ${response.status} - ${errorText}`)
        setMessages([])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const sendMessage = async (content: string, recipientId: string) => {
    if (!content.trim()) return
    
    try {
      setLoadingMessages(true)
      setError(null)
      
      // Create a temporary message to show immediately in the UI
      // Make sure it has the correct sender format to appear on the right side
      const tempMessage: Message = {
        _id: `temp-${Date.now()}`,
        content,
        sender: {
          _id: currentUserId, // This ensures it's recognized as a user message
          name: 'You',
          // Add any other required properties to ensure consistent rendering
          profileImage: undefined,
          username: 'current-user'
        },
        conversation: activeConversation || '',
        readBy: [currentUserId],
        createdAt: new Date().toISOString()
      }
      
      // Add temporary message to the UI immediately without causing a full reload
      setMessages(prev => {
        // Create a new array with the existing messages plus the new one
        const newMessages = [...prev, tempMessage]
        // Return the new array
        return newMessages
      })
      
      // Get token for authentication
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Send message to backend
      const response = await fetch('http://localhost:5001/api/messages/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recipientId,
          content
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        // Remove the temporary message if sending failed
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id))
        throw new Error(`Failed to send message: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('Message sent successfully:', data)
      
      // Remove temporary message and fetch the real messages
      if (activeConversation) {
        fetchMessages(activeConversation)
      } else if (data?.conversation) {
        setActiveConversation(data.conversation)
        fetchMessages(data.conversation)
      }
      
      // Refresh conversation list to update last message
      fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please try again.')
    } finally {
      setLoadingMessages(false)
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    console.log('Marking messages as read for conversation:', conversationId)
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      // Use the correct endpoint for marking messages as read
      const response = await fetch(`http://localhost:5001/api/messages/read/${conversationId}`, {
        method: 'PUT',  // Use PUT method as defined in the backend
        headers
      })
      
      if (response.ok) {
        // Update local messages to reflect read status
        setMessages(prev => {
          return prev.map(msg => {
            // Only update messages that aren't from the current user and aren't already read
            if (msg.sender._id !== currentUserId && !msg.readBy.includes(currentUserId)) {
              return {
                ...msg,
                readBy: [...msg.readBy, currentUserId]
              }
            }
            return msg
          })
        })
        
        // Refresh conversations to update unread counts
        fetchConversations()
      } else {
        console.error('Failed to mark messages as read:', response.status)
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  useEffect(() => {
    if (currentUserId) {
      fetchConversations()
    }
  }, [currentUserId])
  
  const openChat = async (user: ChatUser) => {
    console.log('Opening chat with user:', user)
    setActiveChat(user)
    setIsChatOpen(true)
    setIsChatBubbleOpen(false)
    
    try {
      console.log('All conversations:', conversations)
      console.log('Looking for conversations with user ID:', user.id)
      
      const existingConversation = conversations.find((conv: any) => {
        console.log('Checking conversation:', conv._id, 'with participants:', conv.participants)
        return conv.participants.some((p: any) => p._id === user.id)
      })
      
      console.log('Found existing conversation?', existingConversation ? 'Yes' : 'No')
      
      if (existingConversation) {
        console.log('Setting active conversation to:', existingConversation._id)
        setActiveConversation(existingConversation._id)
        await fetchMessages(existingConversation._id)
        await markMessagesAsRead(existingConversation._id)
      } else {
        console.log('No existing conversation found, starting with empty messages')
        setActiveConversation(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error opening chat:', error)
      setError('Failed to load chat history')
    }
  }

  const closeChat = () => {
    setIsChatOpen(false)
  }

  const minimizeChat = () => {
    setIsChatOpen(false)
    setIsChatBubbleOpen(true)
  }

  const maximizeChat = () => {
    setIsChatOpen(true)
    setIsChatBubbleOpen(false)
  }

  const toggleChatBubble = () => {
    setIsChatBubbleOpen((prev) => !prev)
  }

  return (
    <ChatContext.Provider
      value={{
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
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}