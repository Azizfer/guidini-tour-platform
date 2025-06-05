import axios from 'axios';

// Use environment variable for API URL with fallback to localhost
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token || ''}`
  };
};

export interface Message {
  _id?: string;
  conversationId?: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: Date;
  read?: boolean;
}

export interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: Date;
}

const messageService = {
  // Récupérer les conversations d'un utilisateur
  getUserConversations: async (): Promise<Conversation[]> => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        return [];
      }
      
      const apiUrl = getApiUrl();
      
      // Add timeout to avoid hanging requests
      const response = await axios.get<Conversation[]>(`${apiUrl}/api/messages/conversations`, {
        headers: getAuthHeaders(),
        timeout: 10000 // 10 second timeout
      });
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (error: any) {
      // Silent fail
      return [];
    }
  },

  // Récupérer les messages d'une conversation
  getConversationMessages: async (conversationId: string): Promise<Message[]> => {
    try {
      console.log('🔄 Fetching messages for conversation:', conversationId);
      const response = await axios.get<Message[]>(`${getApiUrl()}/api/messages/conversation/${conversationId}`, {
        headers: getAuthHeaders()
      });
      console.log('✅ Fetched messages:', response.data?.length || 0);
      return response.data || [];
    } catch (error) {
      console.error(`❌ Error fetching messages for conversation ${conversationId}:`, error);
      return [];
    }
  },

  // Envoyer un message
  sendMessage: async (recipientId: string, content: string): Promise<Message> => {
    try {
      console.log('📤 Sending message to recipient:', recipientId);
      const response = await axios.post<Message>(`${getApiUrl()}/api/messages/send`, {
        recipientId,
        content
      }, {
        headers: getAuthHeaders()
      });
      console.log('✅ Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  },

  // Créer ou récupérer une conversation entre deux utilisateurs
  getOrCreateConversation: async (userId1: string, userId2: string): Promise<Conversation> => {
    try {
      console.log('🔄 Creating/fetching conversation between users:', userId1, userId2);
      const response = await axios.post<Conversation>(`${getApiUrl()}/api/messages/conversations`, {
        participants: [userId1, userId2]
      }, {
        headers: getAuthHeaders()
      });
      console.log('✅ Conversation created/fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating/fetching conversation:', error);
      throw error;
    }
  },

  // Marquer les messages comme lus
  markMessagesAsRead: async (conversationId: string): Promise<void> => {
    try {
      console.log('💬 Marking messages as read for conversation:', conversationId);
      // Use the correct API URL format with /api prefix
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      await axios.put(`${apiUrl}/api/messages/read/${conversationId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('✅ Messages marked as read successfully');
      return;
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      // Silently fail instead of throwing
      return;
    }
  },
  
  // Vérifier les nouveaux messages
  checkNewMessages: async (): Promise<number> => {
    try {
      const conversations = await messageService.getUserConversations();
      
      // Count unread messages
      let unreadCount = 0;
      for (const conversation of conversations) {
        if (conversation.lastMessage && !conversation.lastMessage.read) {
          unreadCount++;
        }
      }
      
      return unreadCount;
    } catch (error) {
      console.error('Erreur lors de la vérification des nouveaux messages:', error);
      return 0;
    }
  }
};

export default messageService;
