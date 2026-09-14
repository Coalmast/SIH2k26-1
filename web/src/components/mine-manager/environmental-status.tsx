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
          {/* Progress representing pH value around 7 (neutral) out of 14, ~50% */}
          <Progress value={50} className="mt-2 h-2 bg-secondary" />
        </div>
      </div>
    </Card>
  );
}
