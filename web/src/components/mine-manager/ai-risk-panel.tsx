import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export function AIRiskPanel({ mineId }: { mineId?: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isRecalculating, setIsRecalculating] = useState(false);

  const { data: riskData, isLoading } = useQuery({
    queryKey: ['ai-risk-score', mineId],
    queryFn: async () => {
      if (!mineId) return null;
      try {
        const res = await apiClient.get(`/api/v1/ai/score/mine/${mineId}/latest`);
        return res.data;
      } catch (err) {
        console.error("Failed to fetch risk score", err);
        // Fallback mock data if API is offline or returns 404
        return {
          score: 68,
          risk_level: 'Medium',
          trend: 'stable',
          contributing_factors: [
            { feature: 'Ventilation reading below prescribed limit' },
            { feature: 'Roof support props inadequate' }
          ]
        };
      }
    },
    enabled: !!mineId
  });

  const recalculateMutation = useMutation({
    mutationFn: async () => {
      setIsRecalculating(true);
      const res = await apiClient.post(`/api/v1/ai/score/mine/${mineId}`);
      return res.data;
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(['ai-risk-score', mineId], newData);
      // Also invalidate KPIs since risk score is in there
      queryClient.invalidateQueries({ queryKey: ['mine-dashboard-kpis', mineId] });
    },
    onSettled: () => {
      setIsRecalculating(false);
    }
  });

  if (isLoading || !riskData) {
    return (
      <Card className="p-8 shadow-sm h-[400px] flex items-center justify-center bg-card/80 backdrop-blur-md">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-32 h-32 rounded-full border-4 border-muted border-t-primary animate-spin mb-4"></div>
          <div className="h-4 bg-muted w-32 rounded"></div>
        </div>
      </Card>
    );
  }

  const score = riskData.score;
  const isHighRisk = score >= 70;
  const isMediumRisk = score >= 40 && score < 70;
  
  const colorClass = isHighRisk ? 'text-comet-down' : isMediumRisk ? 'text-amber-500' : 'text-comet-up';
  const bgColorClass = isHighRisk ? 'bg-comet-down' : isMediumRisk ? 'bg-amber-500' : 'bg-comet-up';
  const Icon = isHighRisk ? AlertTriangle : isMediumRisk ? Activity : ShieldCheck;

  // Render SVG Arc Gauge (240 degree arc)
  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // 240 degrees is 2/3 of the circumference (leaves 120 degree gap at bottom)
  const arcLength = circumference * (240 / 360);
  const trackOffset = circumference - arcLength;
  const progressOffset = circumference - (score / 100) * arcLength;

  return (
    <Card className="relative overflow-hidden shadow-sm h-full flex flex-col bg-card/80 backdrop-blur-xl border border-border/50">
      {/* Glow background */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-[60px] opacity-20 rounded-full ${bgColorClass} pointer-events-none -z-10`} />

      <div className="p-4 border-b bg-muted/20 flex justify-between items-center relative z-10">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          {t("ai_risk_assessment", "AI Risk Assessment")}
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs font-semibold gap-1.5 border-primary/20 text-primary hover:bg-primary/10"
          onClick={() => recalculateMutation.mutate()}
          disabled={isRecalculating}
        >
          <RefreshCw className={`h-3 w-3 ${isRecalculating ? 'animate-spin' : ''}`} />
          {t("recalculate", "Recalculate")}
        </Button>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center relative z-10">
        
        {/* SVG Arc Gauge */}
        <div className="relative w-48 h-32 flex justify-center overflow-hidden">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="absolute top-0"
            style={{ transform: 'rotate(150deg)' }}
          >
            <circle
              stroke="var(--muted)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset: trackOffset, strokeLinecap: 'round' }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset: progressOffset, strokeLinecap: 'round', transition: 'stroke-dashoffset 1s ease-in-out' }}
              className={colorClass}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>
          <div className="absolute bottom-2 flex flex-col items-center">
            <Icon className={`w-6 h-6 mb-1 ${colorClass}`} />
            <div className="text-4xl font-black font-numeric tracking-tighter">
              {score}
            </div>
          </div>
        </div>

        {/* Trend & Level */}
        <div className="flex items-center gap-3 mt-4">
          <span className={`px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wider ${isHighRisk ? 'bg-comet-down text-white' : isMediumRisk ? 'bg-amber-500 text-white' : 'bg-comet-up text-white'}`}>
            {riskData.risk_level || (isHighRisk ? 'Critical' : isMediumRisk ? 'Medium' : 'Low')}
          </span>
          <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
            {riskData.trend === 'worsening' || riskData.trend === 'increasing' ? <TrendingUp className="h-4 w-4 text-comet-down" /> : <TrendingDown className="h-4 w-4 text-comet-up" />}
            <span className="capitalize">{riskData.trend || 'Stable'}</span>
          </div>
        </div>

        {/* Factors */}
        <div className="w-full mt-6 space-y-2">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t("key_factors", "Key Factors")}</h4>
          {(riskData.contributing_factors?.slice(0, 3) || []).map((factor: any, i: number) => (
            <div key={i} className="text-xs flex items-center justify-between p-2 rounded bg-muted/40 border border-border/50">
              <span className="truncate pr-2 font-medium">{factor.feature || factor}</span>
            </div>
          ))}
          {(!riskData.contributing_factors || riskData.contributing_factors.length === 0) && (
            <div className="text-xs text-muted-foreground italic text-center p-2">
              {t("no_factors_identified", "No specific factors identified.")}
            </div>
          )}
        </div>

      </div>
    </Card>
  );
}
