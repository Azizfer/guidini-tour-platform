"use client"

import type React from "react"

import Image from "next/image"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { CountryCode } from "../../data/countryCodes"

interface StepTwoProps {
  formData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    countryCode: string
  }
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  setFormData: (formData: any) => void
  phoneError: string
  countryCodes: CountryCode[]
}

export default function StepTwo({ formData, handleInputChange, setFormData, phoneError, countryCodes }: StepTwoProps) {
  // Find the selected country info
  const selectedCountry = countryCodes.find((country) => country.code === formData.countryCode) || countryCodes[0]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Votre prénom"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Votre nom"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="votre@email.com"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="flex items-center">
          Téléphone
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 cursor-help">
                  <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Format attendu: {selectedCountry.format}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <div className="flex">
          <Select
            value={formData.countryCode}
            onValueChange={(value) => setFormData((prev: any) => ({ ...prev, countryCode: value }))}
          >
            <SelectTrigger className="w-[120px] rounded-r-none border-r-0">
              <SelectValue>
                <div className="flex items-center">
                  <div className="w-6 h-4 mr-1 overflow-hidden rounded-sm">
                    <Image
                      src={`https://flagcdn.com/w40/${selectedCountry.country}.png`}
                      alt={selectedCountry.country}
                      width={24}
                      height={16}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className="text-xs mr-1">{selectedCountry.abbr}</span>
                  <span className="text-xs">{selectedCountry.code}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="grid grid-cols-3 gap-1 p-2">
              {countryCodes.map((country) => (
                <SelectItem
                  key={`${country.code}-${country.country}`}
                  value={country.code}
                  className="flex flex-col items-center justify-center cursor-pointer rounded px-2 py-1 hover:bg-gray-100"
                >
                  <div className="w-8 h-6 mb-1 overflow-hidden rounded-sm">
                    <Image
                      src={`https://flagcdn.com/w40/${country.country}.png`}
                      alt={country.country}
                      width={32}
                      height={24}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs mr-1">{country.abbr}</span>
                    <span className="text-xs">{country.code}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1">
            <Input
              id="phoneNumber"
              name="phoneNumber"
              className="rounded-l-none"
              placeholder={selectedCountry.format}
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
            {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
