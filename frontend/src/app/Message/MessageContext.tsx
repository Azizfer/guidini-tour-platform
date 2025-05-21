// Frontend: src/app/MessageContext/MessageContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../LogingContext/AuthContext';
import io from 'socket.io-client'; //library that enbales realtime communincation

interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    profileImage: string;
    username: string;
  };
  content: string;
  readBy: string[];
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: {
    _id: string;
    name: string;
    profileImage: string;
    username: string;
  }[];
  lastMessage: Message;
  updatedAt: string;
  unreadCount: number;
}

interface MessageContextType {
  conversations: Conversation[];
  currentConversation: string | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  setCurrentConversation: (id: string | null) => void;
  sendMessage: (recipientId: string, content: string) => Promise<Message & { conversation: string }>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  getOrCreateConversation: (userId: string) => Promise<string>;
  totalUnreadMessages: number;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io('http://localhost:5001', {
        query: { token: localStorage.getItem('token') }
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated]);

  // Listen for new messages
  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message: Message) => {
        // If message belongs to current conversation, add it to messages
        if (message.conversation === currentConversation) {
          setMessages(prev => [...prev, message]);
          markConversationAsRead(message.conversation);
        }
        
        // Update conversations list
        fetchConversations();
      });
    }
  }, [socket, currentConversation]);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!isAuthenticated) return;
    
    setLoadingConversations(true);
    try {
      const response = await axios.get('http://localhost:5001/api/messages/conversations');
      
      // Type assertion to tell TypeScript what shape the data has
      const conversationsData = response.data as Array<{
        _id: string;
        participants: Array<{
          _id: string;
          name: string;
          profileImage: string;
          username: string;
        }>;
        lastMessage?: {
          sender: string;
          readBy: string[];
        };
        updatedAt: string;
      }>;
      
      // Calculate unread messages for each conversation
      const conversationsWithUnread = conversationsData.map((conv) => {
        const otherParticipant = conv.participants.find((p) => p._id !== user?.id);
        return {
          ...conv,
          otherParticipant,
          lastMessage: conv.lastMessage as unknown as Message, // Type assertion to match Conversation interface
          unreadCount: conv.lastMessage && !conv.lastMessage.readBy.includes(user?.id || '') && 
                       conv.lastMessage.sender !== user?.id ? 1 : 0
        } as Conversation; // Assert as Conversation type
      });
      
      setConversations(conversationsWithUnread as Conversation[]);
      
      // Calculate total unread messages
      const total = conversationsWithUnread.reduce((acc: number, conv: any) => 
        acc + (conv.unreadCount || 0), 0);
      setTotalUnreadMessages(total);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch messages for current conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversation || !isAuthenticated) return;
      
      setLoadingMessages(true);
      try {
        const response = await axios.get(`http://localhost:5001/api/messages/conversation/${currentConversation}`);
        // Type assertion to tell TypeScript that response.data is an array of Message objects
        const messagesData = response.data as Message[];
        setMessages(messagesData);
        
        // Mark messages as read
        await markConversationAsRead(currentConversation);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };
    
    fetchMessages();
  }, [currentConversation, isAuthenticated]);

  // Fetch conversations on mount and when auth state changes
  useEffect(() => {
    fetchConversations();
  }, [isAuthenticated, user]);

  // Send a message
  const sendMessage = async (recipientId: string, content: string) => {
    try {
      const response = await axios.post('http://localhost:5001/api/messages/send', {
        recipientId,
        content
      });
      
      // Type assertion for the response data
      const messageData = response.data as Message & { conversation: string };
      
      // If sending to current conversation, add to messages
      if (messageData.conversation === currentConversation) {
        setMessages(prev => [...prev, messageData]);
      }
      
      // Update conversations
      fetchConversations();
      
      return messageData;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    try {
      await axios.put(`http://localhost:5001/api/messages/read/${conversationId}`);
      
      // Update unread counts
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
      
      // Recalculate total unread
      const total = conversations.reduce((acc, conv) => 
        conv._id === conversationId ? acc : acc + conv.unreadCount, 0);
      setTotalUnreadMessages(total);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Get or create a conversation with a user
  const getOrCreateConversation = async (userId: string): Promise<string> => {
    // Check if conversation already exists
    const existing = conversations.find(conv => 
      conv.participants.some(p => p._id === userId)
    );
    
    if (existing) {
      setCurrentConversation(existing._id);
      return existing._id;
    }
    
    // Create new conversation by sending first message
    try {
      // sendMessage already returns a properly typed response
      const messageResponse = await sendMessage(userId, 'Hello!');
      setCurrentConversation(messageResponse.conversation);
      return messageResponse.conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    loadingConversations,
    loadingMessages,
    setCurrentConversation,
    sendMessage,
    markConversationAsRead,
    getOrCreateConversation,
    totalUnreadMessages
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};