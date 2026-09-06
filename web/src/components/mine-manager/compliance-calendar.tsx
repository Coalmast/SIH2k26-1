import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

export function ComplianceCalendar() {
  const [events, setEvents] = useState<any[]>([])
  const { user } = useAuthStore()

  useEffect(() => {
    async function loadInstances() {
      const mineId = user?.mine_ids?.[0] || '00000000-0000-0000-0000-000000000004'
      
      const { data } = await supabase
        .from('compliance_instances')
        .select(`
          id,
          due_date,
          status,
          compliance_requirements ( title, regulation_reference )
        `)
        .eq('mine_id', mineId)
      
      if (data) {
        const formattedEvents = data.map(item => {
          let color = 'var(--primary)'
          if (item.status === 'approved') color = 'hsl(var(--emerald-500))' // green
          else if (item.status === 'breached') color = 'hsl(var(--destructive))' // red
          else if (item.status === 'in_progress') color = 'hsl(var(--amber-500))' // orange

          return {
            id: item.id,
            title: item.compliance_requirements?.title || 'Compliance Task',
            start: item.due_date,
            allDay: true,
            color,
            extendedProps: {
              status: item.status,
              reg: item.compliance_requirements?.regulation_reference
            }
          }
        })
        setEvents(formattedEvents)
      }
    }
    loadInstances()
  }, [user?.mine_ids])

  return (
    <Card className="flex flex-col shadow-sm">
      <div className="p-4 border-b bg-muted/30 rounded-t-lg">
        <h2 className="text-lg font-semibold text-foreground">Compliance Calendar</h2>
      </div>
      <div className="p-4 flex-1">
        <div className="h-[400px]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            initialDate="2026-09-01" // Set to seed data month for demo
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            events={events}
            height="100%"
            eventClick={(info) => {
              // Optionally navigate to details
              console.log('Clicked', info.event.id)
            }}
          />
        </div>
      </div>
    </Card>
  )
}
