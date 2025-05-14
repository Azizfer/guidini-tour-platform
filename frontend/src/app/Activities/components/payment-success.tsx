"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import MatrixText from "./matrix-text"

interface CheckmarkProps {
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: i * 0.2,
        type: "spring",
        duration: 1.5,
        bounce: 0.2,
        ease: "easeInOut",
      },
      opacity: { delay: i * 0.2, duration: 0.2 },
    },
  }),
}

export function Checkmark({ size = 100, strokeWidth = 2, color = "currentColor", className = "" }: CheckmarkProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      className={className}
    >
      <title>Animated Checkmark</title>
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        stroke={color}
        variants={draw}
        custom={0}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          fill: "transparent",
        }}
      />
      <motion.path
        d="M30 50L45 65L70 35"
        stroke={color}
        variants={draw}
        custom={1}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "transparent",
        }}
      />
    </motion.svg>
  )
}

interface PaymentSuccessProps {
  amount: number
  tourName: string
  date?: string
  participants: number
  orderId?: string
  currency?: string
}

export default function PaymentSuccess({
  amount,
  tourName,
  date,
  participants,
  orderId,
  currency = "TND",
}: PaymentSuccessProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formattedDate = date
    ? new Date(date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <Card className="w-full max-w-sm mx-auto p-6 min-h-[300px] flex flex-col justify-center bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-md rounded-xl">
      <CardContent className="space-y-6 flex flex-col items-center justify-center p-0">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            scale: {
              type: "spring",
              damping: 15,
              stiffness: 200,
            },
          }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 blur-xl bg-blue-500/10 dark:bg-blue-500/20 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: "easeOut",
              }}
            />
            <Checkmark
              size={80}
              strokeWidth={4}
              color="rgb(59, 130, 246)" // Blue color to match the theme
              className="relative z-10 dark:drop-shadow-[0_0_10px_rgba(0,0,0,0.1)]"
            />
          </div>
        </motion.div>

        <div className="h-12 w-full">
          <MatrixText
            text="Paiement Réussi"
            className="text-center"
            initialDelay={300}
            letterAnimationDuration={600}
            letterInterval={80}
            loop={true}
          />
        </div>

        <motion.div
          className="space-y-4 text-center w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <motion.div
            className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 1.2,
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Activité</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{tourName}</span>
              </div>

              {formattedDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Date</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{formattedDate}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Participants</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {participants} {participants > 1 ? "personnes" : "personne"}
                </span>
              </div>

              {orderId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Référence</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{orderId}</span>
                </div>
              )}

              <div className="pt-2 mt-2 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Montant payé</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(amount)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.4 }}
          >
            <Link href="/Activities">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">Terminer</Button>
            </Link>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
