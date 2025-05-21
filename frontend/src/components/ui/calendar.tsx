"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { fr } from "date-fns/locale"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div className="calendar-wrapper">
      <style jsx global>{`
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #0ea5e9;
          --rdp-background-color: #e7edff;
          margin: 0;
        }
        .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
          background-color: var(--rdp-accent-color);
          color: white;
        }
        .rdp-day_today {
          background-color: var(--rdp-background-color);
          font-weight: bold;
        }
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: #f3f4f6;
        }
      `}</style>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        locale={fr}
        {...props}
      />
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
