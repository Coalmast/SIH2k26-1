import { useTranslation } from "react-i18next";
import { Droplet } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function EnvironmentalStatus() {
  const {
    t
  } = useTranslation();

  return (
    <Card className="p-4 shadow-sm h-full">
      <h2 className="text-lg font-semibold text-foreground mb-4">{t("environmental_status", "Environmental Status")}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col p-3 bg-muted/40 rounded-md border">
          <span className="text-xs font-semibold text-muted-foreground uppercase mb-1">{t("avg_pm10", "Avg PM10")}</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-foreground">{t("85", "85")}</span>
            <span className="text-xs font-semibold text-primary">{t("g_m", "µg/m³")}</span>
          </div>
          <Progress value={85} className="mt-2 h-2" />
        </div>
        
        <div className="flex flex-col p-3 bg-muted/40 rounded-md border">
          <span className="text-xs font-semibold text-muted-foreground uppercase mb-1">{t("water_ph", "Water pH")}</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-foreground">{t("7_2", "7.2")}</span>
            <Droplet className="h-5 w-5 text-comet-up fill-emerald-500/20" />
          </div>
          {/* pH scale visualization (0-14, 7 is neutral) */}
          <div className="mt-3 relative h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-emerald-500 to-purple-500">
            <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-4 bg-foreground border border-background rounded-sm shadow-sm" style={{ left: `${(7.2 / 14) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
