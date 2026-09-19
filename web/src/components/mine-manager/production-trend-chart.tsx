"use client";
import { useTranslation } from "react-i18next";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine, ReferenceDot } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useProductionTrend } from "@/features/mines/hooks/useProductionTrend";
import { format } from "date-fns";

const chartConfig = {
  production: {
    label: "Production (MT)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function ProductionTrendChart({ mineId }: { mineId?: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useProductionTrend(mineId);

  if (isLoading || !data) {
    return (
      <Card className="shadow-sm h-[400px] flex items-center justify-center bg-card">
        <div className="animate-pulse w-full px-8 flex flex-col gap-4">
           <div className="h-6 bg-muted rounded w-1/4"></div>
           <div className="h-48 bg-muted/50 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  // Format data for chart
  const formattedData = data.productionData.map((d: any) => ({
    date: format(new Date(d.created_at), 'MMM dd'),
    production: d.quantity_tonnes,
    originalDate: d.created_at
  }));

  // Target line calculation (mocked for now, usually would come from API)
  const targetMT = 48000;

  return (
    <Card className="shadow-sm card-neon-top bg-card h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
           {t("production_trend", "Production Trend")}
           {data.anomalies.length > 0 && (
             <span className="text-xs font-semibold px-2 py-1 bg-destructive/10 text-destructive rounded-md flex items-center gap-1">
               <AlertTriangle className="h-3 w-3" />
               {data.anomalies.length} {t("anomalies", "Anomalies")}
             </span>
           )}
        </CardTitle>
        <CardDescription>{t("last_6_months", "Last 6 months")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[250px]">
          <AreaChart accessibilityLayer data={formattedData} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillProduction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-production)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-production)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8} 
              tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ReferenceLine y={targetMT} stroke="var(--color-destructive)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Target', fill: 'var(--color-destructive)', fontSize: 12 }} />
            
            <Area
              dataKey="production"
              type="monotone"
              fill="url(#fillProduction)"
              fillOpacity={1}
              stroke="var(--color-production)"
              strokeWidth={2}
            />
            
            {/* Draw anomalies as red dots if we had precise matching dates, simplified for demo */}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">{t("trending_up_by_5_2_this_month", "Trending up by 5.2% this month")}<TrendingUp className="h-4 w-4 text-comet-up" />
        </div>
        <div className="leading-none text-muted-foreground">{t(
          "showing_total_production_for_t",
          "Showing total production for the selected period"
        )}</div>
      </CardFooter>
    </Card>
  );
}
