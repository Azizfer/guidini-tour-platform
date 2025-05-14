"use client"

import type React from "react"

import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

// Default max team size if not specified via props
const DEFAULT_MAX_TEAM_SIZE = 10

const animations = {
  container: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  avatar: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
  },
  vibration: {
    initial: { x: 0 },
    vibrate: { x: [-5, 5, -5, 5, 0], transition: { duration: 0.3 } },
  },
} as const

const avatarUrls = [
  "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png",
  "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-02-albo9B0tWOSLXCVZh9rX9KFxXIVWMr.png",
  "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-03-JateJIUhtd3PXynaMG9TDWQ55j5AVP.png",
  "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-04-uuYHWIRvVPi01gEt6NwnGyjqLeeZhz.png",
] as const

interface ParticipantCounterProps {
  compact?: boolean
  onChange?: (count: number) => void
  maxCount?: number
}

export default function ParticipantCounter({ compact = false, onChange, maxCount = DEFAULT_MAX_TEAM_SIZE }: ParticipantCounterProps) {
  const [peopleCount, setPeopleCount] = useState(1)
  const [isVibrating, setIsVibrating] = useState(false)

  function handleIncrement(e: React.MouseEvent) {
    e.preventDefault()
    if (peopleCount < maxCount) {
      const newCount = peopleCount + 1
      setPeopleCount(newCount)
      if (onChange) onChange(newCount)
    } else triggerVibration()
  }

  function handleDecrement(e: React.MouseEvent) {
    e.preventDefault()
    if (peopleCount > 1) {
      const newCount = peopleCount - 1
      setPeopleCount(newCount)
      if (onChange) onChange(newCount)
    } else triggerVibration()
  }

  function triggerVibration() {
    setIsVibrating(true)
    setTimeout(() => setIsVibrating(false), 300)
  }

  function renderAvatars() {
    return Array.from({ length: peopleCount }, (_, i) => (
      <motion.div
        key={i}
        variants={animations.avatar}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex items-center justify-center"
        style={{
          zIndex: peopleCount - i,
          marginLeft: i === 0 ? 0 : compact ? -16 : -24,
        }}
      >
        <Image
          src={avatarUrls[i % avatarUrls.length] || "/placeholder.svg"}
          width={compact ? 48 : 96}
          height={compact ? 48 : 96}
          alt={`Team member ${i + 1}`}
          className="rounded-full object-cover"
        />
      </motion.div>
    ))
  }

  return (
    <motion.div
      variants={animations.container}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex w-full flex-col items-center justify-center gap-4"
    >
      <div className={`relative ${compact ? "h-12" : "h-24"} w-full flex justify-center`}>
        <AnimatePresence>{renderAvatars()}</AnimatePresence>
      </div>
      <motion.div
        variants={
          isVibrating
            ? {
                initial: { x: 0 },
                vibrate: {
                  x: [0, -5, 5, -5, 5, 0],
                  transition: { duration: 0.3 },
                },
              }
            : undefined
        }
        initial="initial"
        animate={isVibrating ? "vibrate" : "initial"}
        className="flex items-center gap-4"
      >
        <button
          type="button"
          onClick={handleDecrement}
          className={`${compact ? "h-8 w-8" : "h-12 w-12"} rounded-full border border-zinc-200 dark:border-zinc-800 
                             bg-white dark:bg-zinc-900 
                             hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                             text-zinc-900 dark:text-zinc-100 cursor-pointer`}
        >
          <span className={`${compact ? "text-lg" : "text-2xl"} font-medium`}>-</span>
        </button>

        <motion.span
          key={peopleCount}
          variants={animations.container}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`${compact ? "text-lg" : "text-2xl"} font-medium text-zinc-900 dark:text-zinc-100`}
        >
          {peopleCount}
        </motion.span>

        <button
          type="button"
          onClick={handleIncrement}
          className={`${compact ? "h-8 w-8" : "h-12 w-12"} rounded-full border border-zinc-200 dark:border-zinc-800 
                             bg-white dark:bg-zinc-900 
                             hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                             text-zinc-900 dark:text-zinc-100 cursor-pointer`}
        >
          <span className={`${compact ? "text-lg" : "text-2xl"} font-medium`}>+</span>
        </button>
      </motion.div>
    </motion.div>
  )
}
