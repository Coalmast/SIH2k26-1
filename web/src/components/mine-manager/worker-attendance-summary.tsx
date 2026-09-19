import { useTranslation } from "react-i18next";
import { Users, UserX, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAttendanceSummary } from '@/features/mines/hooks/useAttendanceSummary';
import { useState } from 'react';

export function WorkerAttendanceSummary({ mineId }: { mineId?: string }) {
  const { t } = useTranslation();
  const { data: summary, isLoading } = useAttendanceSummary(mineId);

  // Simplified current shift logic
  const currentHour = new Date().getHours();
  const defaultShift = currentHour >= 8 && currentHour < 16 ? 'A' : currentHour >= 16 && currentHour < 24 ? 'B' : 'C';
  const [activeShift, setActiveShift] = useState(defaultShift);

  if (isLoading) {
    return (
      <Card className="p-4 shadow-sm h-full flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-10 bg-muted rounded w-full"></div>
        </div>
      </Card>
    );
  }

  const shiftData = [
    { name: 'Shift A', count: summary?.shiftA || 142, id: 'A' },
    { name: 'Shift B', count: summary?.shiftB || 135, id: 'B' },
    { name: 'Shift C', count: summary?.shiftC || 130, id: 'C' }
  ];
  
  // Calculate mock fatigue and absenteeism based on the active shift
  const mockAbsenteeism = activeShift === 'A' ? 0 : activeShift === 'B' ? 5 : 2;
  const mockFatigue = activeShift === 'A' ? 2 : activeShift === 'B' ? 12 : 5;

  return (
    <Card className="flex flex-col shadow-sm card-neon-top relative overflow-hidden bg-card">
      <div className="p-4 border-b bg-muted/30">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t("worker_attendance", "Worker Attendance")}
        </h2>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          {shiftData.map((shift) => {
            const isActive = activeShift === shift.id;
            return (
              <button 
                key={shift.id} 
                onClick={() => setActiveShift(shift.id)}
                className={`p-2 rounded-md border text-center flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-primary/20 hover:border-primary/50 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive ? 'bg-primary/10 border-primary text-primary shadow-[0_0_10px_rgba(var(--color-primary),0.2)]' : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-xs font-semibold uppercase">{shift.name}</span>
                <span className={`text-xl font-bold font-numeric mt-1 ${isActive ? 'text-primary' : 'text-foreground'}`}>{shift.count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 items-center p-3 bg-muted/30 rounded-lg border">
          <div className="flex-1 flex flex-col">
             <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold mb-1 uppercase">
                <UserX className="h-3.5 w-3.5" /> Absenteeism
             </div>
             <span className="text-lg font-bold font-numeric text-comet-down">
               {summary?.total ? Math.round((summary.absent / summary.total) * 100) : mockAbsenteeism}%
             </span>
          </div>
          
          <div className="h-10 w-px bg-border"></div>

          <div className="flex-1 flex flex-col">
             <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold mb-1 uppercase">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Fatigue Risk
             </div>
             <span className="text-lg font-bold font-numeric">
               {mockFatigue}
             </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
