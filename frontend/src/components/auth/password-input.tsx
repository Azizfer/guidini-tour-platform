"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { Label } from "@/components/ui/label"

interface PasswordInputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  showRequirements?: boolean
  required?: boolean
  error?: string
}

const passwordRequirements = [
  { label: "8+ caractères", test: (v: string) => v.length >= 8 },
  { label: "Chiffre", test: (v: string) => /\d/.test(v) },
  { label: "Minuscule", test: (v: string) => /[a-z]/.test(v) },
  { label: "Majuscule", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Caractère spécial (!@#$)", test: (v: string) => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
]

export default function PasswordInput({
  label = "Mot de passe",
  placeholder = "••••••••",
  value,
  onChange,
  showRequirements = true,
  required = false,
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState(false)

  const getStrength = (value: string): number => {
    if (!value) return 0
    return passwordRequirements.filter((req) => req.test(value)).length * 20
  }

  const strength = getStrength(value)
  const strengthLabel = strength <= 40 ? "Faible" : strength <= 80 ? "Moyen" : "Fort"

  // Get color based on strength
  const getStrengthColor = () => {
    if (strength <= 20) return "bg-red-500"
    if (strength <= 40) return "bg-orange-500"
    if (strength <= 60) return "bg-yellow-500"
    if (strength <= 80) return "bg-blue-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor="password-input" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div
        className={cn(
          "relative rounded-lg border transition-all duration-200",
          focused ? "border-teal-400 ring-2 ring-teal-100" : "border-zinc-200 dark:border-zinc-800",
          error ? "border-red-300 ring-2 ring-red-100" : "",
        )}
      >
        <input
          id="password-input"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "w-full px-3 py-2 pr-10 bg-transparent text-sm text-zinc-900 dark:text-zinc-100",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
            "focus:outline-none",
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Cacher le mot de passe" : "Montrer le mot de passe"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}

      {value && showRequirements && (
        <div className="mt-2 space-y-2">
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStrengthColor()} transition-all duration-500 ease-out`}
              style={{ width: `${strength}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            Force: <span className="font-medium">{strengthLabel}</span>
          </p>

          <div className="space-y-1.5 text-xs text-gray-500 pt-1">
            {passwordRequirements.map(({ label, test }) => (
              <div key={label} className="flex items-center gap-2">
                {test(value) ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <X className="w-3.5 h-3.5 text-gray-400" />
                )}
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
