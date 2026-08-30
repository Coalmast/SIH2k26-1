import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useComplianceHealth } from '../hooks/useCompliance';
import { ResponsiveContainer, RadialBarChart, RadialBar, Tooltip } from 'recharts';
import { AlertCircle } from 'lucide-react';

export function ComplianceHealthScore({ mineId }: { mineId: string }) {
  const { data: health, isLoading, error } = useComplianceHealth(mineId);

  if (isLoading) {
    return <Card className="w-full h-[200px] flex items-center justify-center bg-card/50 backdrop-blur border-border/50"><div className="animate-pulse">Loading health score...</div></Card>;
  }

  if (error || !health) {
    return (
      <Card className="w-full h-[200px] flex items-center justify-center bg-card/50 backdrop-blur border-border/50 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          <p>No health data available for this mine</p>
        </div>
      </Card>
    );
  }

  const { score, total, overdue, pending, mom_change } = health;

  let color = 'hsl(142, 71%, 45%)'; // green
  if (score < 50) color = 'hsl(4, 86%, 58%)'; // red
  else if (score <= 75) color = 'hsl(35, 95%, 50%)'; // amber

  const chartData = [
    { name: 'Base', value: 100, fill: 'hsl(var(--muted))' },
    { name: 'Score', value: score, fill: color },
  ];

  return (
    <Card className="w-full bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Compliance Health</CardTitle>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${mom_change >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {mom_change > 0 ? '+' : ''}{mom_change} MoM
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="h-[120px] w-[120px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={chartData} startAngle={90} endAngle={-270}>
                <RadialBar background dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-bold" style={{ color }}>{score}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between w-32">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{total}</span>
            </div>
            <div className="flex justify-between w-32">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-semibold">{pending}</span>
            </div>
            <div className="flex justify-between w-32">
              <span className="text-red-500">Overdue</span>
              <span className="font-semibold text-red-500">{overdue}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
