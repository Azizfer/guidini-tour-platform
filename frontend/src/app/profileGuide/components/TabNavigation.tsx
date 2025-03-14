"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Image, Users, Bell, MessageSquare, Star, Settings , HelpCircle } from "lucide-react";
import ToursManagement from "./ToursManagement";
import GuideGallery from "./GuideGallery";
import GuideReservations from "./GuideReservations";
import GuideNotifications from "./GuideNotification";
import GuideChat from "./GuideChat/GuideChat";
import GuideSettings from "./GuideSettings";
import GuideReviews from "./GuideReviews";
import Help from "./Help";
// Remove GuideChatbot import since it's no longer needed
// import GuideChatbot from "./GuideChatbot"; 

// Define the props interface for TabNavigation
interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
        <TabsTrigger value="tours" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden md:inline">Tours</span>
        </TabsTrigger>
        <TabsTrigger value="gallerie" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          <span className="hidden md:inline">Gallerie</span>
        </TabsTrigger>
        <TabsTrigger value="reservations" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden md:inline">Reservations</span>
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="hidden md:inline">Notifications</span>
        </TabsTrigger>
        <TabsTrigger value="discussion" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden md:inline">Discussion</span>
        </TabsTrigger>
        <TabsTrigger value="avis" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          <span className="hidden md:inline">Avis</span>
        </TabsTrigger>
        <TabsTrigger value="paramètres" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden md:inline">Aaramètres</span>
        </TabsTrigger>
        <TabsTrigger value="help" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden md:inline">Contact</span> 
        </TabsTrigger>
      </TabsList>
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
    </Tabs>
  );
}