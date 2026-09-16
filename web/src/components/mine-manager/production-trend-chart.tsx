"use client";
import { useTranslation } from "react-i18next";

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A simple area chart"

const chartData = [
  { month: "January", production: 186 },
  { month: "February", production: 305 },
  { month: "March", production: 237 },
  { month: "April", production: 73 },
  { month: "May", production: 209 },
  { month: "June", production: 214 },
]

const chartConfig = {
  production: {
    label: "Production (Tons)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function ProductionTrendChart() {
  const {
    t
  } = useTranslation();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{t("production_trend", "Production Trend")}</CardTitle>
        <CardDescription>{t("january_june_2024", "January - June 2024")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[250px]">
          <AreaChart accessibilityLayer data={chartData} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillProduction" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-production)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-production)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="production"
              type="natural"
              fill="url(#fillProduction)"
              fillOpacity={1}
              stroke="var(--color-production)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">{t("trending_up_by_5_2_this_month", "Trending up by 5.2% this month")}<TrendingUp className="h-4 w-4 text-comet-up" />
        </div>
        <div className="leading-none text-muted-foreground">{t(
          "showing_total_production_for_t",
          "Showing total production for the last 6 months"
        )}</div>
      </CardFooter>
    </Card>
  );
}
