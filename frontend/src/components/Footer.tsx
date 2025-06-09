"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 border-t border-gray-200/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Guidini</span>
            </div>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              Découvrez la Tunisie authentique avec nos guides locaux experts.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="h-3 w-3 text-blue-500" />
                <span>Tunis, Tunisie</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="h-3 w-3 text-blue-500" />
                <span>+216 XX XXX XXX</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
              >
                <Facebook className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
              >
                <Instagram className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
              >
                <Twitter className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-sm font-semibold mb-4 text-gray-900">Liens rapides</h3>
            <ul className="space-y-2">
              {[
                { href: "/destinations", label: "Destinations" },
                { href: "/activities", label: "Activités" },
                { href: "/guides", label: "Guides locaux" },
                { href: "/about", label: "À propos" },
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold mb-4 text-gray-900">Support</h3>
            <ul className="space-y-2">
              {[
                { href: "/contact", label: "Contact" },
                { href: "/faq", label: "FAQ" },
                { href: "/help", label: "Centre d'aide" },
                { href: "/terms", label: "Conditions" },
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold mb-4 text-gray-900">Newsletter</h3>
            <p className="text-gray-600 mb-3 text-sm">Restez informé de nos dernières offres.</p>
            <div className="flex">
              <Input
                type="email"
                placeholder="Votre email"
                className="flex-1 bg-white border-gray-300 text-gray-800 placeholder:text-gray-500 focus:border-blue-500 rounded-l-lg text-sm h-9"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-3 h-9">
                <Mail className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-500 text-sm">© 2024 Guidini. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-3 md:mt-0">
            <Link href="/privacy" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">
              Conditions d'utilisation
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
