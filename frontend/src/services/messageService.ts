import axios from 'axios';

// Use both relative URL and direct backend URL to ensure connectivity
const API_URL = '/api';
const DIRECT_API_URL = 'http://localhost:5001/api';

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
      const response = await axios.get<Conversation[]>(`${API_URL}/messages/conversations`);
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return [];
    }
  },

  // Récupérer les messages d'une conversation
  getConversationMessages: async (conversationId: string): Promise<Message[]> => {
    try {
      const response = await axios.get<Message[]>(`${API_URL}/messages/conversation/${conversationId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Erreur lors de la récupération des messages de la conversation ${conversationId}:`, error);
      return [];
    }
  },

  // Envoyer un message
  sendMessage: async (recipientId: string, content: string): Promise<Message> => {
    try {
      const response = await axios.post<Message>(`${API_URL}/messages/send`, {
        recipientId,
        content
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  },

  // Créer ou récupérer une conversation entre deux utilisateurs
  getOrCreateConversation: async (userId1: string, userId2: string): Promise<Conversation> => {
    try {
      const response = await axios.post<Conversation>(`${API_URL}/messages/conversations`, {
        participants: [userId1, userId2]
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création/récupération de la conversation:', error);
      throw error;
    }
  },

  // Marquer les messages comme lus
  markMessagesAsRead: async (conversationId: string): Promise<void> => {
    try {
      await axios.put(`${API_URL}/messages/read/${conversationId}`);
      return;
    } catch (error) {
      console.error(`Erreur lors du marquage des messages comme lus:`, error);
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
