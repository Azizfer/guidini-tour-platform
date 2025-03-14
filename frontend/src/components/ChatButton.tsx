"use client"
import React from "react";
import { useState } from "react"
import { MessageCircle, X } from "lucide-react"

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg p-4 w-80 h-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Chat</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-72 bg-gray-100 rounded p-2 mb-4">
            {}
            <p className="text-center text-gray-500 mt-20">Le chat sera bientôt disponible!</p>
          </div>
          <input
            type="text"
            placeholder="Tapez votre message..."
            className="w-full px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled
          />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}

