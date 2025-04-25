"use client";
import { useState, useEffect, useRef } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { User } from "lucide-react";
import { Settings } from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import { ROUTES } from '@/lib/routes';

import Link from "next/link";


interface UserProps {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}


export default function ProfilePopover({ user:initialUser }: { user: UserProps }) {
  const [open, setOpen] = useState(false);
  const [currentUser,setCurrentUser]=useState<UserProps>(initialUser);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        if (userId && token) {
          const response = await fetch(`/api/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [initialUser]); // Add initialUser as dependency

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]); // Only re-run when open changes

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    
    if (window.location.pathname.includes('/profileGuide')) {
      window.location.href = '/';
    } else {
      window.location.reload();
    }//This solution will ensure that when users click logout from the profile guide page, they'll be redirected to the home page while maintaining all other functionality.
  };
  return (
    <div className="relative" ref={dropdownRef}>
         <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 cursor-pointer flex items-center justify-center"
            onClick={() =>setOpen((prev)=> !prev)}
          >
            <User className="w-5 h-5" /> 
        </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
        <Link href={ROUTES.GUIDE_PROFILE} passHref legacyBehavior>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full flex gap-1 items-center"
              onClick={() => setOpen(false)}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
          </Link>
          <Link href="/cart" passHref>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full flex gap-1 items-center"
              onClick={() => setOpen(false)}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Panier</span>
            </Button>
          </Link>
          <Link href="/cart" passHref>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full flex gap-1 items-center"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full flex gap-1 items-center"
            onClick={handleLogout}
          >
            <LogOut size={14} />
            Déconnexion
          </Button>
        </div>
      )}
    </div>
  );
}
