"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface SimpleInputProps {
  label: string
  placeholder?: string
  type?: string
  value?: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
}

export default function SimpleInput({
  label,
  placeholder,
  type = "text",
  value = "",
  onChange,
  required = false,
  error,
}: SimpleInputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        className={cn(
          "relative rounded-lg border transition-all duration-200",
          focused ? "border-teal-400 ring-2 ring-teal-100" : "border-zinc-200 dark:border-zinc-800",
          error ? "border-red-300 ring-2 ring-red-100" : "",
        )}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "w-full px-3 py-2 bg-transparent text-sm text-zinc-900 dark:text-zinc-100",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
            "focus:outline-none",
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
