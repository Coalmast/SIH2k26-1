import { useTranslation } from "react-i18next";
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
  const {
    t
  } = useTranslation();

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
                <span>{t("trust_score", "Trust Score")}</span>
                <span className={colors[rating].split(" ")[1]}>{score}{t("100", "/100")}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("document_validity", "Document Validity")}</span>
                  <span>{breakdown.documents}{t("text", "%")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("safety_record", "Safety Record")}</span>
                  <span>{breakdown.safety}{t("text", "%")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("capa_resolution", "CAPA Resolution")}</span>
                  <span>{breakdown.capa}{t("text", "%")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("billing_accuracy", "Billing Accuracy")}</span>
                  <span>{breakdown.billing}{t("text", "%")}</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
