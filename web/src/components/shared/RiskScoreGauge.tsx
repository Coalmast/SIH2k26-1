import { useTranslation } from "react-i18next";
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, ShieldCheck, Activity } from 'lucide-react'

interface RiskScoreGaugeProps {
  score: number
  label?: string
  trend?: 'up' | 'down' | 'stable'
}

export function RiskScoreGauge({ score, label = "AI Risk Score", trend = 'stable' }: RiskScoreGaugeProps) {
  const {
    t
  } = useTranslation();

  // Score interpretation (0-100 where higher is riskier, or 0-100 where higher is safer?)
  // Usually Risk Score: Higher = Riskier. Let's assume 0-100, >70 is Critical, 40-70 Medium, <40 Low
  const isHighRisk = score >= 70
  const isMediumRisk = score >= 40 && score < 70

  const color = isHighRisk ? 'text-comet-down' : isMediumRisk ? 'text-amber-500' : 'text-comet-up'
  const bgColor = isHighRisk ? 'bg-comet-down' : isMediumRisk ? 'bg-amber-500' : 'bg-comet-up'
  const Icon = isHighRisk ? AlertTriangle : isMediumRisk ? Activity : ShieldCheck

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Background glow */}
        <div className={`absolute w-32 h-32 blur-3xl opacity-20 rounded-full ${bgColor} pointer-events-none -z-10`} />

        <div className="flex flex-col items-center text-center space-y-2">
          <Icon className={`w-8 h-8 ${color} mb-2`} />
          <div className="text-4xl font-black text-foreground tracking-tighter">
            {score}<span className="text-xl text-muted-foreground/70 font-medium">{t("100", "/100")}</span>
          </div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{label}</h3>
        </div>

        <div className="w-full mt-6 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground/70 font-medium">
            <span>{t("safe", "Safe")}</span>
            <span>{t("critical", "Critical")}</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${bgColor} transition-all duration-1000`} 
              style={{ width: `${score}%` }} 
            />
          </div>
        </div>

        {trend !== 'stable' && (
          <div className={`mt-4 text-xs font-medium px-2 py-1 rounded-md ${trend === 'up' ? 'bg-[#f6465d]/10 text-comet-down' : 'bg-[#0ecb81]/10 text-comet-up'}`}>
            {trend === 'up' ? '↑ Risk increasing' : '↓ Risk decreasing'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
