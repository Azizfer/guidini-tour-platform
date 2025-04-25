"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, User, ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggle from "./ThemeToggle";
import Modal from "./Modal";
import ProfilePopover from "./ProfilePopover";
import NotificationButton from "./NotificationButton";

export default function Header() {
  const [language, setLanguage] = useState("Français");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    // Check for user only on client side
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (!isMounted) {
    // Return a simplified header during SSR/initial render
    return (
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md py-2"
          : "bg-white dark:bg-gray-900 py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src="/images/logo.png"
              alt="Guidini"
              className="h-10"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-sm"
              >
                {language}
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("Français")}>
                Français
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("English")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("العربية")}>
                العربية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <>
              <NotificationButton />
              <ProfilePopover user={user} />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-1 text-sm"
                onClick={openModal}
              >
                <User size={16} />
                <span>Se connecter</span>
              </Button>
              <Modal isOpen={isModalOpen} closeModal={closeModal} />
            </>
          )}

          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-6 mt-8">
                {!user && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={openModal}
                  >
                    <User size={16} className="mr-2" />
                    Se connecter
                  </Button>
                )}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">Langue</h3>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setLanguage("Français")}
                    >
                      Français
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setLanguage("English")}
                    >
                      English
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setLanguage("العربية")}
                    >
                      العربية
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}