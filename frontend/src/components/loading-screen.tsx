"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"

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
        className="w-40 h-40" 
      >
        <Image
          src="/logos/guidini-logo.svg"
          alt="Loading..."
          width={600} 
          height={600} 
          className="object-contain" 
          priority
        />
      </motion.div>
      {/* Animated loading dots */}
      <div className="flex items-center justify-center mt-4">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full mx-1"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default function LoadingScreen({ alwaysShow = false }: LoadingScreenProps) {
  if (alwaysShow) {
    return <LoadingSpinnerUI />;
  }

  const [isVisible, setIsVisible] = useState(false);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Show loading screen when pathname changes
    setIsVisible(true);
    
    // Hide after a short delay
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isVisible) {
    return null;
  }

  return <LoadingSpinnerUI />;
}
