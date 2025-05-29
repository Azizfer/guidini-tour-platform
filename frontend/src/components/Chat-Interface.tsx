"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, X, MessageSquare, Minimize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChat, ChatUser } from "@/contexts/chat-context"
import ChatCard from "./chat-card"
import { cn } from "@/lib/utils"

export default function ChatInterface() {
  const { 
    activeChat, 
    isChatOpen, 
    isChatBubbleOpen, 
    messages, 
    unreadCount,
    sendMessage, 
    openChat, 
    closeChat, 
    minimizeChat, 
    maximizeChat,
    toggleChatBubble,
    conversations,
    error
  } = useChat()
  
  // State to track which chat bubbles are visible - initialize as empty array (no bubbles on page refresh)
  const [visibleBubbles, setVisibleBubbles] = useState<string[]>([])
  // Maximum number of visible bubbles
  const MAX_VISIBLE_BUBBLES = 3
  
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Get current user ID from JWT token
  const getCurrentUserId = (): string => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        // Simple JWT parsing
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        )

        const payload = JSON.parse(jsonPayload)
        return payload._id || payload.userId || payload.id
      }
    } catch (e) {
      console.error("Error getting current user ID:", e)
    }

    // No fallback ID - user must be logged in
    return ""
  }
  
  const currentUserId = getCurrentUserId()
  
  // Only proceed if we have a valid user ID and clear bubbles on page refresh
  useEffect(() => {
    if (!currentUserId) {
      // User is not logged in, don't show any chat functionality
      setVisibleBubbles([]);
    } else {
      // Always start with no bubbles on page refresh
      setVisibleBubbles([]);
    }
  }, [currentUserId]);
  
  // Determine if there are any unread messages for the active chat
  const hasUnreadMessages = activeChat && currentUserId ? messages.some(
    msg => msg.sender && msg.sender._id === activeChat.id && Array.isArray(msg.readBy) && !msg.readBy.includes(currentUserId)
  ) : false
  
  // Get recent conversations for bubbles
  const recentConversations = conversations
    .filter(conv => {
      // Filter out conversations without participants or last message
      return conv.participants && conv.participants.length > 0 && conv.lastMessage;
    })
    .sort((a, b) => {
      // Sort by last message date (newest first)
      const dateA = new Date(a.lastMessage?.createdAt || 0);
      const dateB = new Date(b.lastMessage?.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, MAX_VISIBLE_BUBBLES) // Limit to max visible bubbles
    .map(conv => {
      // Find the other participant (not current user)
      const otherParticipant = conv.participants.find(
        (p: any) => p._id !== currentUserId
      );
      
      // Check if this conversation has unread messages
      const hasUnread = conv.lastMessage && 
        conv.lastMessage.sender && 
        conv.lastMessage.sender._id !== currentUserId && 
        Array.isArray(conv.lastMessage.readBy) && 
        !conv.lastMessage.readBy.includes(currentUserId);
      
      return {
        id: conv._id,
        participantId: otherParticipant?._id,
        name: otherParticipant?.name || otherParticipant?.firstName || (otherParticipant?.username ? otherParticipant.username.replace(/\d+$/, '') : 'Contact'),
        avatar: otherParticipant?.profileImage,
        lastMessage: conv.lastMessage?.content,
        lastMessageDate: conv.lastMessage?.createdAt,
        hasUnread
      };
    });
    
  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isChatOpen])

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || !activeChat) return

    sendMessage(input, activeChat.id)
    setInput("")
  }
  
  // Toggle visibility of a specific chat bubble
  const toggleBubbleVisibility = (conversationId: string) => {
    setVisibleBubbles(prev => {
      if (prev.includes(conversationId)) {
        // Remove this bubble
        return prev.filter(id => id !== conversationId);
      } else {
        // Add this bubble, but ensure we don't exceed max
        const newBubbles = [...prev, conversationId];
        if (newBubbles.length > MAX_VISIBLE_BUBBLES) {
          // Remove the oldest bubble (first in array)
          return newBubbles.slice(1);
        }
        return newBubbles;
      }
    });
  }
  
  // Open a specific chat from a bubble
  const openChatFromBubble = (conversationId: string) => {
    const conversation = recentConversations.find(conv => conv.id === conversationId);
    if (conversation) {
      const chatUser: ChatUser = {
        id: conversation.participantId || '',
        name: conversation.name,
        avatar: conversation.avatar,
        online: false
      };
      openChat(chatUser);
    }
  }
  
  // Add a conversation to visible bubbles when it's opened
  const addToBubbles = (conversationId: string) => {
    if (!visibleBubbles.includes(conversationId)) {
      setVisibleBubbles(prev => {
        const newBubbles = [...prev, conversationId];
        if (newBubbles.length > MAX_VISIBLE_BUBBLES) {
          // Remove the oldest bubble (first in array)
          return newBubbles.slice(1);
        }
        return newBubbles;
      });
    }
  }
  
  // We no longer automatically add bubbles when chat is closed
  // Instead, we'll only add bubbles when the minimize button is clicked

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col items-end">
      {/* Chat Card */}
      {isChatOpen && activeChat && (
        <ChatCard 
          onClose={() => {
            // Simply close the chat without affecting bubbles
            closeChat();
          }} 
          onMinimize={() => {
            // First find the conversation for this active chat
            if (activeChat) {
              const activeConversation = recentConversations.find(
                conv => conv.participantId === activeChat.id
              );
              
              // Add this conversation to visible bubbles
              if (activeConversation) {
                addToBubbles(activeConversation.id);
              }
            }
            
            // Then minimize the chat
            minimizeChat();
          }} 
        />
      )}

      {/* Chat Bubbles Container - positioned relative to the Chatbot component */}
      <div className="fixed bottom-[calc(1.75rem+44px)] right-5 z-40 flex flex-col-reverse items-end">
        <AnimatePresence>
          {/* Chat Bubbles */}
          {recentConversations
            .filter(conv => visibleBubbles.includes(conv.id) && (!activeChat || conv.participantId !== activeChat.id))
            .map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="mb-1"
              >
                <div className="relative group">
                  {/* Hover tooltip with receiver name and message preview */}
                  <motion.div 
                    className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-2 min-w-[150px] max-w-[200px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    initial={{ opacity: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium truncate">{conv.name}</span>
                      <span className="text-xs text-gray-500 truncate">{conv.lastMessage || 'Nouvelle conversation'}</span>
                    </div>
                    <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
                  </motion.div>
                  
                  {/* Close button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBubbleVisibility(conv.id);
                    }}
                    className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-50 border border-gray-200"
                  >
                    <X className="h-3 w-3 text-gray-600" />
                  </button>
                  
                  {/* Chat bubble button */}
                  <motion.button
                    onClick={() => openChatFromBubble(conv.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full shadow-md flex items-center justify-center bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 w-11 h-11 ${conv.hasUnread ? "ring-2 ring-white" : ""}`}
                  >
                    {conv.avatar ? (
                      <div className="bg-white/20 rounded-full p-1">
                        <img 
                          src={conv.avatar} 
                          alt={conv.name}
                          className="size-5 object-cover"
                        />
                      </div>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                        />
                      </svg>
                    )}
                    {conv.hasUnread && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center"></span>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          
          {/* Active Chat Bubble */}
          {(isChatBubbleOpen && activeChat) && (
            <motion.div
              key="active-bubble"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-3"
            >
              <div className="relative group">
                {/* Hover tooltip with receiver name */}
                <motion.div 
                  className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-2 min-w-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  initial={{ opacity: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 justify-center">
                    <span className="text-xs font-medium truncate">{activeChat.name}</span>
                  </div>
                  <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
                </motion.div>
                
                {/* Chat bubble button */}
                <motion.button
                  onClick={maximizeChat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full shadow-md flex items-center justify-center bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 w-11 h-11"
                >
                  {activeChat.avatar ? (
                    <div className="bg-white/20 rounded-full p-1">
                      <img 
                        src={activeChat.avatar} 
                        alt={activeChat.name}
                        className="size-5 object-cover"
                      />
                    </div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                      />
                    </svg>
                  )}
                  {hasUnreadMessages && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center"></span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}