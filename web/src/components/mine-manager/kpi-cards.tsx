import { useTranslation } from "react-i18next";
import { ArrowUp, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@tanstack/react-router';
import { useMineDashboardKPIs } from '@/features/mines/hooks/useMineDashboardKPIs';
import { NumberTicker } from '@/components/ui/number-ticker';

export function KpiCards({ mineId }: { mineId?: string }) {
  const { t } = useTranslation();
  const { data: kpis, isLoading } = useMineDashboardKPIs(mineId);

  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-28 shadow-sm flex items-center justify-center bg-card">
            <div className="animate-pulse flex flex-col w-full px-5">
              <div className="h-3 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Compliance Score */}
      <Link to="/compliance" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl h-full">
        <Card className="flex flex-col shadow-sm kpi-hover card-neon-top h-full bg-card overflow-hidden shimmer-number relative">
          <CardHeader className="pb-2 pt-5 px-5 flex flex-row justify-between items-start relative z-10">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{t("compliance_score", "Compliance Score")}</CardTitle>
            <CheckCircle className="h-5 w-5 text-comet-up" />
          </CardHeader>
          <CardContent className="px-5 pb-5 flex-1 flex items-end justify-between relative z-10">
            <div className="text-4xl font-bold font-numeric text-foreground">
              <NumberTicker value={kpis.complianceScore} />
            </div>
            <div className="text-xs font-semibold text-comet-up flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />{t("2_mom", "2 MoM")}</div>
          </CardContent>
        </Card>
      </Link>

      {/* Open Violations */}
      <Link to="/inspection" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl h-full">
        <Card className="flex flex-col shadow-sm kpi-hover card-neon-top h-full bg-card overflow-hidden shimmer-number relative">
          <CardHeader className="pb-2 pt-5 px-5 flex flex-row justify-between items-start relative z-10">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{t("open_violations", "Open Violations")}</CardTitle>
            <AlertTriangle className="h-5 w-5 text-comet-down" />
          </CardHeader>
          <CardContent className="px-5 pb-5 flex-1 flex items-end justify-between relative z-10">
            <div className="text-4xl font-bold font-numeric text-foreground">
              <NumberTicker value={kpis.openViolations} />
            </div>
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 rounded-sm font-semibold">
              {t("critical_alerts", "Critical")}
            </Badge>
          </CardContent>
        </Card>
      </Link>

      {/* Contractor Score */}
      <Link to="/contractors" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl h-full">
        <Card className="flex flex-col shadow-sm kpi-hover card-neon-top h-full bg-card overflow-hidden shimmer-number relative">
          <CardHeader className="pb-2 pt-5 px-5 flex flex-row justify-between items-start relative z-10">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{t("contractor_score", "Contractor Score")}</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent className="px-5 pb-5 flex-1 flex items-end gap-1 relative z-10">
            <div className="text-4xl font-bold font-numeric text-foreground">
              <NumberTicker value={kpis.contractorScore} />
            </div>
            <div className="text-sm font-numeric text-muted-foreground mb-1">{t("100", "/100")}</div>
          </CardContent>
        </Card>
      </Link>

      {/* Production */}
      <Link to="/production" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl h-full">
        <Card className="flex flex-col shadow-sm kpi-hover card-neon-top h-full bg-card overflow-hidden shimmer-number relative">
          <CardHeader className="pb-2 pt-5 px-5 flex flex-row justify-between items-start relative z-10">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{t("production_mt", "Production (MT)")}</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="px-5 pb-5 flex-1 flex flex-col justify-end relative z-10">
            <div className="text-4xl font-bold font-numeric text-foreground">
              <NumberTicker value={kpis.productionMT} />
            </div>
            <div className="w-full bg-secondary mt-3 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: '94%' }}></div>
            </div>
            <span className="text-xs text-muted-foreground mt-2 text-right">{t("vs_target", "vs Target")}</span>
          </CardContent>
        </Card>
      </Link>

      {/* AI Risk Score */}
      <Link to="/ai-analytics" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl h-full">
        <Card className="flex flex-col shadow-sm kpi-hover card-neon-top h-full bg-card overflow-hidden shimmer-number relative">
          <CardHeader className="pb-2 pt-5 px-5 flex flex-row justify-between items-start relative z-10">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{t("ai_risk_score", "AI Risk Score")}</CardTitle>
            <CheckCircle className="h-5 w-5 text-comet-up" />
          </CardHeader>
          <CardContent className="px-5 pb-5 flex-1 flex flex-col justify-end relative z-10">
            <div className="text-4xl font-bold font-numeric text-foreground">
              <NumberTicker value={kpis.aiRiskScore} />
            </div>
            <div className="w-full bg-secondary mt-3 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${100 - kpis.aiRiskScore}%`, backgroundColor: kpis.aiRiskScore > 70 ? 'var(--color-destructive)' : 'var(--color-primary)' }}></div>
            </div>
            <span className="text-xs text-muted-foreground mt-2 text-right">{t("lower_is_better", "Lower is better")}</span>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
