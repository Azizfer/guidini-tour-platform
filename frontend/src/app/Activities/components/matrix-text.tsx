"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LetterState {
  char: string
  isMatrix: boolean
  isSpace: boolean
}

interface MatrixTextProps {
  text?: string
  className?: string
  initialDelay?: number
  letterAnimationDuration?: number
  letterInterval?: number
  loop?: boolean
  loopInterval?: number
}

const MatrixText = ({
  text = "HelloWorld!",
  className,
  initialDelay = 200,
  letterAnimationDuration = 500,
  letterInterval = 100,
  loop = false,
  loopInterval = 5000,
}: MatrixTextProps) => {
  const [letters, setLetters] = useState<LetterState[]>(() =>
    text.split("").map((char) => ({
      char,
      isMatrix: false,
      isSpace: char === " ",
    })),
  )
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getRandomChar = useCallback(() => (Math.random() > 0.5 ? "1" : "0"), [])

  const animateLetter = useCallback(
    (index: number) => {
      if (index >= text.length) return

      requestAnimationFrame(() => {
        setLetters((prev) => {
          const newLetters = [...prev]
          if (!newLetters[index].isSpace) {
            newLetters[index] = {
              ...newLetters[index],
              char: getRandomChar(),
              isMatrix: true,
            }
          }
          return newLetters
        })

        setTimeout(() => {
          setLetters((prev) => {
            const newLetters = [...prev]
            newLetters[index] = {
              ...newLetters[index],
              char: text[index],
              isMatrix: false,
            }
            return newLetters
          })
        }, letterAnimationDuration)
      })
    },
    [getRandomChar, text, letterAnimationDuration],
  )

  const startAnimation = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    let currentIndex = 0

    const animate = () => {
      if (currentIndex >= text.length) {
        setIsAnimating(false)
        return
      }

      animateLetter(currentIndex)
      currentIndex++
      timeoutRef.current = setTimeout(animate, letterInterval)
    }

    animate()
  }, [animateLetter, text, isAnimating, letterInterval])

  useEffect(() => {
    const timer = setTimeout(startAnimation, initialDelay)

    return () => {
      clearTimeout(timer)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Add loop functionality
  useEffect(() => {
    if (!loop) return

    const loopTimer = setInterval(() => {
      if (!isAnimating) {
        startAnimation()
      }
    }, loopInterval)

    return () => clearInterval(loopTimer)
  }, [loop, loopInterval, isAnimating, startAnimation])

  const motionVariants = useMemo(
    () => ({
      matrix: {
        color: "#3b82f6", // Blue color
        textShadow: "0 2px 4px rgba(59, 130, 246, 0.5)", // Blue shadow
      },
    }),
    [],
  )

  return (
    <div
      className={cn("flex items-center justify-center text-black dark:text-white h-16", className)}
      aria-label="Matrix text animation"
    >
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center">
          {letters.map((letter, index) => (
            <motion.div
              key={`${index}-${letter.char}`}
              className="font-mono text-3xl md:text-5xl w-[1ch] text-center overflow-hidden"
              initial="initial"
              animate={letter.isMatrix ? "matrix" : "normal"}
              variants={motionVariants}
              transition={{
                duration: 0.1,
                ease: "easeInOut",
              }}
              style={{
                display: "inline-block",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {letter.isSpace ? "\u00A0" : letter.char}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MatrixText
