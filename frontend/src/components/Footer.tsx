"use client"

import { motion } from "framer-motion"
import { Send, Facebook, Instagram, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function GuidiniLogo2({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
          <rect x="8" y="16" width="24" height="16" rx="2" fill="#FFFFFF" />
          <rect x="6" y="14" width="28" height="4" rx="2" fill="#F3F4F6" />
          <rect x="16" y="10" width="8" height="6" rx="1" fill="#E5E7EB" />
          <path d="M 18 10 Q 20 8 22 10" stroke="#E5E7EB" strokeWidth="2" fill="none" />
          <circle cx="20" cy="24" r="6" fill="#2563EB" fillOpacity="0.2" />
          <path d="M 20 21 L 22 24 L 20 27 L 18 24 Z" fill="#2563EB" />
        </svg>
      </div>
      <span className="font-bold text-xl text-white">Guidini</span>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          {/* Logo and Description */}
          <div className="lg:w-1/3">
            <GuidiniLogo2 className="mb-4" />
            <p className="text-gray-600 mb-6 max-w-xs text-sm">
              Profitez des circuits avec Guidini - votre partenaire de voyage en Tunisie
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="icon" className="rounded-full border-gray-300">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-gray-300">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-gray-300">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Essential Links */}
          <div className="lg:w-1/3 flex justify-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Liens Utiles</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    À propos de nous
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Centre d'aide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Conditions d'utilisation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Guide de voyage
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* Newsletter - Compact */}
          <div className="lg:w-1/3 flex justify-end">
            <div className="bg-gray-900 rounded-xl overflow-hidden w-full max-w-xs p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Newsletter</h3>
              <p className="text-white/80 text-sm mb-3">
                Recevez nos actualités et offres spéciales
              </p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 transition-colors duration-200">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 pt-5 text-center">
          <p className="text-gray-600 text-sm">© 2024 Guidini. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
