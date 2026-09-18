import { useTranslation } from "react-i18next";
import { useEffect } from 'react';
import { Droplet, Wind, Volume2, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEnvironmentReadings } from '@/features/mines/hooks/useEnvironmentReadings';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function EnvironmentalStatus({ mineId }: { mineId?: string }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: readings, isLoading } = useEnvironmentReadings(mineId);

  useEffect(() => {
    if (!mineId) return;

    // Supabase Realtime for environment_readings
    const channel = supabase
      .channel(`env_readings:mine_id=eq.${mineId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'environment_readings', filter: `mine_id=eq.${mineId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['environment-readings', mineId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mineId, queryClient]);

  if (isLoading || !readings) {
    return (
      <Card className="p-4 shadow-sm h-full bg-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t("environmental_status", "Environmental Status")}</h2>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex flex-col p-3 bg-muted/40 rounded-md border h-24 animate-pulse">
              <div className="h-3 w-16 bg-muted mb-2 rounded"></div>
              <div className="h-8 w-12 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Helper to extract reading
  const getReading = (param: string, defaultVal: number) => {
    return readings[param]?.reading_value || defaultVal;
  };
  const isBreached = (param: string) => {
    return readings[param]?.threshold_breached || false;
  };

  const pm10 = getReading('pm10', 85);
  const pm25 = getReading('pm2_5', 45);
  const ph = getReading('ph', 7.2);
  const noise = getReading('noise_db', 78);

  return (
    <Card className="p-4 shadow-sm h-full bg-card card-neon-top">
      <h2 className="text-lg font-semibold text-foreground mb-4">{t("environmental_status", "Environmental Status")}</h2>
      <div className="grid grid-cols-2 gap-4">
        
        {/* PM10 */}
        <div className={`flex flex-col p-3 rounded-md border transition-colors ${isBreached('pm10') ? 'bg-destructive/10 border-destructive glow-critical relative z-10' : 'bg-muted/40'}`}>
          <span className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
            <Wind className="h-3 w-3" /> {t("avg_pm10", "Avg PM10")}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold font-numeric ${isBreached('pm10') ? 'text-destructive' : 'text-foreground'}`}>
              {pm10}
            </span>
            <span className="text-[10px] font-semibold text-primary">{t("g_m", "µg/m³")}</span>
          </div>
          <Progress value={Math.min((pm10 / 100) * 100, 100)} className="mt-2 h-1.5" />
        </div>

        {/* PM2.5 */}
        <div className={`flex flex-col p-3 rounded-md border transition-colors ${isBreached('pm2_5') ? 'bg-destructive/10 border-destructive glow-critical relative z-10' : 'bg-muted/40'}`}>
          <span className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
            <Wind className="h-3 w-3" /> {t("pm2_5", "PM2.5")}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold font-numeric ${isBreached('pm2_5') ? 'text-destructive' : 'text-foreground'}`}>
              {pm25}
            </span>
            <span className="text-[10px] font-semibold text-primary">{t("g_m", "µg/m³")}</span>
          </div>
          <Progress value={Math.min((pm25 / 60) * 100, 100)} className="mt-2 h-1.5" />
        </div>
        
        {/* pH */}
        <div className={`flex flex-col p-3 rounded-md border transition-colors ${isBreached('ph') ? 'bg-destructive/10 border-destructive glow-critical relative z-10' : 'bg-muted/40'}`}>
          <span className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
            <Droplet className="h-3 w-3" /> {t("water_ph", "Water pH")}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold font-numeric ${isBreached('ph') ? 'text-destructive' : 'text-foreground'}`}>
              {ph}
            </span>
          </div>
          <div className="mt-2.5 relative h-1.5 w-full rounded-full bg-gradient-to-r from-red-500 via-emerald-500 to-purple-500">
            <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-3.5 bg-foreground border border-background rounded-sm shadow-sm transition-all duration-1000" style={{ left: `${(ph / 14) * 100}%` }}></div>
          </div>
        </div>

        {/* Noise */}
        <div className={`flex flex-col p-3 rounded-md border transition-colors ${isBreached('noise_db') ? 'bg-destructive/10 border-destructive glow-critical relative z-10' : 'bg-muted/40'}`}>
          <span className="text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
            <Volume2 className="h-3 w-3" /> {t("noise", "Noise")}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold font-numeric ${isBreached('noise_db') ? 'text-destructive' : 'text-foreground'}`}>
              {noise}
            </span>
            <span className="text-[10px] font-semibold text-primary">dB</span>
          </div>
          <Progress value={Math.min((noise / 120) * 100, 100)} className="mt-2 h-1.5" />
        </div>

      </div>
    </Card>
  );
}
