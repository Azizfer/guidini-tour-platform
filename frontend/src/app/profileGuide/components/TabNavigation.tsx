"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, ImageIcon, Users, Bell, MessageSquare, Star, Settings, HelpCircle } from "lucide-react"
import ToursManagement from "./ToursManagement"
import GuideGallery from "./GuideGallery"
import GuideReservations from "./GuideReservations"
import GuideNotifications from "./GuideNotification"
import GuideChat from "./GuideChat/GuideChat"
import GuideSettings from "./GuideSettings"
import GuideReviews from "./GuideReviews"
import Help from "./Help"

// Define the props interface for TabNavigation
interface TabNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabVariants = {
    inactive: { opacity: 0.7 },
    active: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    hover: {
      scale: 1.05,
      opacity: 1,
      transition: { duration: 0.2 },
    },
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full bg-white/20 backdrop-blur-md rounded-full p-1 border border-white/20 shadow-md">
          <TabsTrigger
            value="tours"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
          >
            <motion.div
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === "tours" ? "active" : "inactive"}
              whileHover="hover"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Tours</span>
            </motion.div>
          </TabsTrigger>
          <TabsTrigger
            value="gallerie"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
          >
            <motion.div
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === "gallerie" ? "active" : "inactive"}
              whileHover="hover"
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              <span className="hidden md:inline">Gallerie</span>
            </motion.div>
          </TabsTrigger>
          <TabsTrigger
            value="reservations"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
          >
            <motion.div
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === "reservations" ? "active" : "inactive"}
              whileHover="hover"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Reservations</span>
            </motion.div>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
          >
            <motion.div
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === "notifications" ? "active" : "inactive"}
              whileHover="hover"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Notifications</span>
            </motion.div>
          </TabsTrigger>
          <TabsTrigger
            value="discussion"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
          >
            <motion.div
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === "discussion" ? "active" : "inactive"}
              whileHover="hover"
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Discussion</span>
            </motion.div>
          </TabsTrigger>
          <TabsTrigger
            value="avis"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
          >
            <motion.div
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === "avis" ? "active" : "inactive"}
              whileHover="hover"
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              <span className="hidden md:inline">Avis</span>
            </motion.div>
          </TabsTrigger>
          <TabsTrigger
            value="paramètres"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
          >
            <motion.div
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === "paramètres" ? "active" : "inactive"}
              whileHover="hover"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Paramètres</span>
            </motion.div>
          </TabsTrigger>
          <TabsTrigger
            value="help"
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-400 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-full transition-all duration-300"
          >
            <motion.div
              variants={tabVariants}
              initial="inactive"
              animate={activeTab === "help" ? "active" : "inactive"}
              whileHover="hover"
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden md:inline">Contact</span>
            </motion.div>
          </TabsTrigger>
        </TabsList>

        <motion.div key={activeTab} initial="hidden" animate="visible" exit="exit" variants={contentVariants}>
          <TabsContent value="tours" className="mt-6">
            <ToursManagement />
          </TabsContent>
          <TabsContent value="gallerie" className="mt-6">
            <GuideGallery />
          </TabsContent>
          <TabsContent value="reservations" className="mt-6">
            <GuideReservations />
          </TabsContent>
          <TabsContent value="notifications" className="mt-6">
            <GuideNotifications />
          </TabsContent>
          <TabsContent value="discussion" className="mt-6">
            <GuideChat />
          </TabsContent>
          <TabsContent value="avis" className="mt-6">
            <GuideReviews />
          </TabsContent>
          <TabsContent value="paramètres" className="mt-6">
            <GuideSettings />
          </TabsContent>
          <TabsContent value="help" className="mt-6">
            <Help />
          </TabsContent>
        </motion.div>
      </Tabs>
    </motion.div>
  )
}
