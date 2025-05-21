import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// This is a placeholder until we implement the full MessageContext
// Replace this with the actual useMessages hook when ready
const useMessages = () => {
  return {
    conversations: [],
    totalUnreadMessages: 3, // Placeholder for demonstration
    setCurrentConversation: (id: string) => console.log('Set conversation:', id)
  };
};

export default function MessagesIconWithPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { conversations, totalUnreadMessages, setCurrentConversation } = useMessages();
  const router = useRouter();

  const handleOpenMessages = () => {
    router.push('/messages');
    setIsOpen(false);
  };

  const handleConversationClick = (conversationId: string) => {
    setCurrentConversation(conversationId);
    router.push(`/messages/${conversationId}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
      >
        <MessageSquare className="h-4 w-4 text-gray-700" />
        
        {totalUnreadMessages > 0 && (
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">
              {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
            </span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 z-50"
          >
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Messages</h3>
              <button
                onClick={handleOpenMessages}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                See all
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No conversations yet
                </div>
              ) : (
                <div>Conversations would appear here</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
