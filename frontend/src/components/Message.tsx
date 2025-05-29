// Frontend: src/components/MessagesIconWithPopover.tsx
import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessages } from '@/app/Message/MessageContext';
import { useRouter } from 'next/navigation';

export default function MessagesIconWithPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const { conversations, totalUnreadMessages, setCurrentConversation } = useMessages();
  const router = useRouter();

  // Listen for the custom closeMessagePopover event
  useEffect(() => {
    const handleClosePopover = () => {
      setIsOpen(false);
    };

    // Add event listener
    window.addEventListener('closeMessagePopover', handleClosePopover);
    
    // Clean up
    return () => {
      window.removeEventListener('closeMessagePopover', handleClosePopover);
    };
  }, []);

  const handleOpenMessages = () => {
    // Don't navigate to messages page
    // router.push('/messages');
    setIsOpen(false);
  };

  const handleConversationClick = (conversationId: string) => {
    // Set current conversation but don't navigate
    setCurrentConversation(conversationId);
    
    // Close this popover
    setIsOpen(false);
    
    // Dispatch custom event to close all message popovers
    window.dispatchEvent(new Event('closeMessagePopover'));
    
    // Additional fallback - click the document body
    setTimeout(() => {
      document.body.click();
    }, 100);
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
                conversations.slice(0, 5).map((conversation) => {
                  const otherUser = conversation.participants.find(
                    (p) => p._id !== localStorage.getItem('userId')
                  );
                  
                  return (
                    <div
                      key={conversation._id}
                      onClick={() => handleConversationClick(conversation._id)}
                      className={`p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 ${
                        conversation.unreadCount > 0 ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-200">
                        {otherUser?.profileImage ? (
                          <img
                            src={otherUser.profileImage}
                            alt={otherUser.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <span className="text-lg font-medium text-gray-500">
                              {otherUser?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {otherUser?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      
                      {conversation.unreadCount > 0 && (
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}