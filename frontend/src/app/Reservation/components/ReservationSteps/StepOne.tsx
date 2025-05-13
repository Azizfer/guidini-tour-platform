"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

interface StepOneProps {
  activity: {
    price: number
    maxParticipants: number
    dates?: string[]
  }
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  participants: number
  setParticipants: (participants: number) => void
}

export default function StepOne({ activity, date, setDate, participants, setParticipants }: StepOneProps) {
  const availableDates = activity.dates
    ? activity.dates.map((dateStr) => new Date(dateStr))
    : [new Date(), new Date(Date.now() + 86400000), new Date(Date.now() + 86400000 * 2)]

  const totalPrice = activity.price * participants

  const generateParticipantOptions = () => {
    const options = []
    for (let i = 1; i <= activity.maxParticipants; i++) {
      options.push(
        <SelectItem key={i} value={i.toString()}>
          {i} {i === 1 ? "personne" : "personnes"}
        </SelectItem>,
      )
    }
    return options
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date de réservation</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal" id="date">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => {
                // Disable dates that are not in availableDates
                return !availableDates.some(
                  (availableDate) =>
                    availableDate.getDate() === date.getDate() &&
                    availableDate.getMonth() === date.getMonth() &&
                    availableDate.getFullYear() === date.getFullYear(),
                )
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="participants">Nombre de participants</Label>
        <Select value={participants.toString()} onValueChange={(value) => setParticipants(Number.parseInt(value))}>
          <SelectTrigger id="participants">
            <SelectValue placeholder="Sélectionner le nombre" />
          </SelectTrigger>
          <SelectContent>{generateParticipantOptions()}</SelectContent>
        </Select>
      </div>

      <div className="pt-4">
        <div className="flex justify-between items-center py-2 font-medium">
          <span>Prix par personne</span>
          <span>{activity.price} DT</span>
        </div>
        <div className="flex justify-between items-center py-2 font-medium">
          <span>Nombre de participants</span>
          <span>x {participants}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between items-center py-2 font-bold">
          <span>Total</span>
          <span className="text-lg">{totalPrice} DT</span>
        </div>
      </div>
    </div>
  )
}
