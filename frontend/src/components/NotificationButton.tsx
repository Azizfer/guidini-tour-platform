"use client";

import { Bell } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// Move mock data outside component to prevent recreation on re-renders
const MOCK_NOTIFICATIONS = [
  { id: 1, message: "Nouveau guide disponible près de vous" },
  { id: 2, message: "Votre réservation a été confirmée" },
  { id: 3, message: "Découvrez nos nouvelles destinations !" },
];

export default function NotificationButton() {
  const [notifications, setNotifications] = useState<typeof MOCK_NOTIFICATIONS>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize state in useEffect to ensure client-side only
  useEffect(() => {
    setIsMounted(true);
    setNotifications(MOCK_NOTIFICATIONS);
    
    // Here you would typically fetch real notifications:
    // async function fetchNotifications() {
    //   const res = await fetch('/api/notifications');
    //   setNotifications(await res.json());
    // }
    // fetchNotifications();
  }, []);

  if (!isMounted) {
    // Return a fallback that matches the button's size to prevent layout shift
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell size={20} />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {notifications.length > 0 && (
            <span 
              className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
              aria-label={`${notifications.length} notifications`}
            >
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <h4 className="font-semibold text-sm mb-2">Notifications</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-muted p-2 rounded-md text-sm text-gray-800 dark:text-gray-200"
            >
              {notif.message}
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Aucune notification.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}