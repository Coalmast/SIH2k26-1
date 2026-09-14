import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type TrustRiskRating = "LOW" | "MEDIUM" | "HIGH"

export interface ContractorTrustBadgeProps {
  score: number
  riskRating?: TrustRiskRating
  breakdown?: {
    documents: number
    safety: number
    capa: number
    billing: number
  }
  className?: string
}

export function ContractorTrustBadge({
  score,
  riskRating,
  breakdown,
  className
}: ContractorTrustBadgeProps) {
  const rating = riskRating || (score >= 75 ? "LOW" : score >= 50 ? "MEDIUM" : "HIGH")

  const colors = {
    LOW: "border-green-500 text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/50",
    MEDIUM: "border-amber-500 text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50",
    HIGH: "border-red-500 text-comet-down bg-[#f6465d]/10 dark:text-comet-down dark:bg-red-950/50"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex h-12 w-12 items-center justify-center rounded-full border-4 font-bold transition-transform hover:scale-105",
              colors[rating],
              className
            )}
          >
            {score}
          </div>
        </TooltipTrigger>
        
        {breakdown && (
          <TooltipContent className="w-56 p-3 shadow-lg">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between font-semibold border-b pb-2">
                <span>Trust Score</span>
                <span className={colors[rating].split(" ")[1]}>{score}/100</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document Validity</span>
                  <span>{breakdown.documents}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Safety Record</span>
                  <span>{breakdown.safety}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CAPA Resolution</span>
                  <span>{breakdown.capa}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Accuracy</span>
                  <span>{breakdown.billing}%</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
