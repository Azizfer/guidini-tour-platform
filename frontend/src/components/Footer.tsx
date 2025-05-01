"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800">À propos</h3>
            <Separator className="bg-gray-200" />
            <p className="text-gray-600 text-sm">
              Guidini est votre partenaire de voyage en Tunisie, offrant des expériences authentiques avec des guides
              locaux certifiés.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-teal-600 rounded-full">
                <Facebook size={18} />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-teal-600 rounded-full">
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-teal-600 rounded-full">
                <Twitter size={18} />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-teal-600 rounded-full">
                <Youtube size={18} />
                <span className="sr-only">Youtube</span>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800">Liens rapides</h3>
            <Separator className="bg-gray-200" />
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  <span>Qui sommes-nous</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  <span>Blog</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  <span>Centre d'aide</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  <span>Contactez-nous</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  <span>FAQ</span>
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800">Légal</h3>
            <Separator className="bg-gray-200" />
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  <span>Conditions générales</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  <span>Politique de confidentialité</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-teal-600 transition-colors flex items-center">
                  <ExternalLink size={14} className="mr-2" />
                  <span>Cookies</span>
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800">Newsletter</h3>
            <Separator className="bg-gray-200" />
            <p className="text-gray-600 text-sm">Inscrivez-vous pour recevoir nos offres spéciales et actualités</p>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Votre email"
                className="bg-white border-gray-200 text-gray-800 placeholder:text-gray-500 focus-visible:ring-teal-600"
              />
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">S'inscrire</Button>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 text-sm">123 Rue de Tunis, Tunis 1000, Tunisie</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
                <span className="text-gray-600 text-sm">+216 71 123 456</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0" />
                <a href="mailto:guidiniwebsite@gmail.com" className="text-gray-600 hover:text-teal-500 text-sm">
                  guidiniwebsite@gmail.com
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <Separator className="bg-gray-200 my-6" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">&copy; {currentYear} Guidini. Tous droits réservés.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="text-gray-600 hover:text-teal-600 text-sm">
              Conditions générales
            </Link>
            <Link href="#" className="text-gray-600 hover:text-teal-600 text-sm">
              Confidentialité
            </Link>
            <Link href="#" className="text-gray-600 hover:text-teal-600 text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
