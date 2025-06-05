"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"

interface LoadingScreenProps {
  alwaysShow?: boolean;
}

const LoadingSpinnerUI = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="flex flex-col items-center justify-center">
      <motion.div
        animate={{ scale: [1, 0.9, 1], opacity: [1, 0.8, 1] }} 
        transition={{
          duration: 1.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-32 h-32" 
      >
        <Image
          src="/logos/guidini-logo.svg"
          alt="Loading..."
          width={450} 
          height={450} 
          className="object-contain" 
          priority
        />
      </motion.div>
    </div>
  </div>
);

export default function LoadingScreen({ alwaysShow = false }: LoadingScreenProps) {
  if (alwaysShow) {
    return <LoadingSpinnerUI />;
  }

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsVisible(true);
    const handleComplete = () => setIsVisible(false);

    window.addEventListener("next-route-change-start", handleStart);
    window.addEventListener("next-route-change-complete", handleComplete);

    return () => {
      window.removeEventListener("next-route-change-start", handleStart);
      window.removeEventListener("next-route-change-complete", handleComplete);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return <LoadingSpinnerUI />;
}
