import { Check, Clock, AlertCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export type ViolationStep = "observation" | "capa_assigned" | "in_progress" | "closed"

interface ViolationTimelineProps {
  currentStep: ViolationStep
  isOverdue?: boolean
  className?: string
}

const steps = [
  { id: "observation", label: "Observation", icon: FileText },
  { id: "capa_assigned", label: "CAPA Assigned", icon: Clock },
  { id: "in_progress", label: "In Progress", icon: AlertCircle },
  { id: "closed", label: "Closed", icon: Check },
]

export function ViolationTimeline({
  currentStep,
  isOverdue = false,
  className
}: ViolationTimelineProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)

  return (
    <div className={cn("relative flex w-full justify-between", className)}>
      {/* Connecting Line */}
      <div className="absolute top-4 left-0 w-full -translate-y-1/2 h-0.5 bg-muted"></div>
      
      {/* Active Line */}
      <div 
        className="absolute top-4 left-0 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
      ></div>

      {steps.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const Icon = step.icon

        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
            <div 
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 bg-background transition-colors",
                isCompleted ? "border-primary bg-primary text-primary-foreground" :
                isCurrent ? "border-primary text-primary" : "border-muted text-muted-foreground",
                (isCurrent && isOverdue) && "border-red-500 text-comet-down animate-pulse bg-[#f6465d]/10 dark:bg-red-950"
              )}
            >
              <Icon className="size-4" />
            </div>
            <span className={cn(
              "text-xs font-medium",
              (isCurrent || isCompleted) ? "text-foreground" : "text-muted-foreground",
              (isCurrent && isOverdue) && "text-comet-down"
            )}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
