import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export function ComplianceCalendar({ mineId }: { mineId?: string }) {
  const { t } = useTranslation();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!mineId) return;

    async function loadInstances() {
      const { data, error } = await supabase
        .from('compliance_instances')
        .select(`
          id, status, due_date,
          compliance_requirements(title)
        `)
        .eq('mine_id', mineId!);
      
      if (data) {
        let formattedEvents = data.map((item: any) => {
          let color = 'hsl(var(--muted))'; // default gray
          let textColor = 'hsl(var(--muted-foreground))';
          
          if (item.status === 'pending') {
            color = 'hsl(var(--primary))'; // yellow
            textColor = 'hsl(var(--primary-foreground))';
          } else if (item.status === 'approved') {
            color = 'hsl(var(--chart-2))'; // green
            textColor = '#ffffff';
          } else if (item.status === 'breached') {
            color = 'hsl(var(--destructive))'; // red
            textColor = 'hsl(var(--destructive-foreground))';
          } else if (item.status === 'in_progress') {
            color = 'hsl(var(--chart-4))'; // turquoise
            textColor = '#ffffff';
          }

          const req = Array.isArray(item.compliance_requirements) ? item.compliance_requirements[0] : item.compliance_requirements;

          return {
            id: item.id,
            title: req?.title || 'Compliance Task',
            start: item.due_date,
            allDay: true,
            color,
            textColor,
            extendedProps: {
              status: item.status
            }
          };
        });

        // Mock events if empty
        if (formattedEvents.length === 0) {
           formattedEvents = [
             { id: 'mock1', title: 'Environmental Audit', start: '2026-09-12', allDay: true, color: 'hsl(var(--primary))', textColor: 'hsl(var(--primary-foreground))' },
             { id: 'mock2', title: 'Safety Gear Check', start: '2026-09-05', allDay: true, color: 'hsl(var(--chart-2))', textColor: '#ffffff' },
             { id: 'mock3', title: 'Equipment Licensing', start: '2026-09-20', allDay: true, color: 'hsl(var(--destructive))', textColor: 'hsl(var(--destructive-foreground))' }
           ];
        }
        setEvents(formattedEvents);
      }
    }
    loadInstances();

    // Supabase Realtime for calendar
    const channel = supabase
      .channel(`compliance_calendar:mine_id=eq.${mineId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'compliance_instances', filter: `mine_id=eq.${mineId}` },
        () => {
          loadInstances(); // Reload on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mineId]);

  return (
    <Card className="flex flex-col shadow-sm card-neon-top bg-card h-full">
      <div className="p-4 border-b bg-muted/30 flex flex-col xl:flex-row justify-between xl:items-center gap-3 shrink-0">
        <h2 className="text-lg font-semibold text-foreground whitespace-nowrap">{t("compliance_calendar", "Compliance Calendar")}</h2>
        
        {/* Status Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-2 text-[10px] uppercase font-semibold text-muted-foreground">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary"></div> PENDING</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-chart-4"></div> IN PROGRESS</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-chart-2"></div> APPROVED</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-destructive"></div> BREACHED</div>
        </div>
      </div>
      <div className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          initialDate="2026-09-01" // Set to seed data month for demo
          fixedWeekCount={false}
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'today'
          }}
          events={events}
          height={380}
          eventClick={(info) => {
            window.location.href = `/compliance/${info.event.id}`;
          }}
        />
      </div>
    </Card>
  );
}
