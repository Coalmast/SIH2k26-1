import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ComplianceCalendar() {
  return (
    <Card className="flex flex-col shadow-sm">
      <div className="p-4 border-b bg-muted/30 rounded-t-lg">
        <h2 className="text-lg font-semibold text-foreground">Compliance Calendar</h2>
      </div>
      <div className="p-4 flex-1">
        <div className="h-[400px]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridWeek,timeGridDay'
            }}
            events={[
              { title: 'Form V Filing', start: new Date(new Date().setDate(new Date().getDate() - 2)), allDay: true },
              { title: 'Explosive Return', start: new Date(), color: 'var(--destructive)' },
              { title: 'Safety Meeting', start: new Date(), color: 'var(--primary)' },
              { title: 'Air Quality Audit', start: new Date(new Date().setDate(new Date().getDate() + 1)), color: 'gray', allDay: true }
            ]}
            height="100%"
          />
        </div>
      </div>
    </Card>
  )
}
