import { cn } from "@/lib/utils"

export type ShiftType = "A" | "B" | "C" | "General" | "Daily"

interface ShiftPickerProps {
  value: ShiftType
  onChange: (shift: ShiftType) => void
  includeDaily?: boolean
  className?: string
}

const SHIFTS: ShiftType[] = ["A", "B", "C", "General"]

export function ShiftPicker({
  value,
  onChange,
  includeDaily = false,
  className
}: ShiftPickerProps) {
  
  const options = includeDaily ? [...SHIFTS, "Daily" as ShiftType] : SHIFTS

  return (
    <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)}>
      {options.map((shift) => {
        const isSelected = value === shift
        return (
          <button
            key={shift}
            onClick={() => onChange(shift)}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isSelected
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground"
            )}
          >
            {shift === "Daily" ? "Aggregate" : `Shift ${shift}`}
          </button>
        )
      })}
    </div>
  )
}
