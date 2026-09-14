import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type CAPAStatus = "assigned" | "in_progress" | "overdue" | "verified_closed"

interface CAPAStatusBadgeProps {
  status: CAPAStatus
  className?: string
}

const statusConfig = {
  assigned: {
    label: "Assigned",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
  },
  overdue: {
    label: "Overdue",
    className: "bg-[#f6465d]/15 text-comet-down animate-pulse hover:bg-[#f6465d]/15 dark:bg-red-900/30 dark:text-comet-down"
  },
  verified_closed: {
    label: "Verified & Closed",
    className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
  }
}

export function CAPAStatusBadge({ status, className }: CAPAStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium border-transparent", config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
