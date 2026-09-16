import { useEffect } from 'react'
import { AlertTriangle, CheckCircle, Info, Bell } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { AnimatedList } from '@/components/ui/animated-list'
import { useAlertStore, AlertPriority } from '@/stores/alert-store'
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts'

export function LiveAlertFeed({ mineId = 'mock-mine-1' }: { mineId?: string }) {
  const { alerts, setAlerts, addAlert, unreadCount } = useAlertStore()

  useRealtimeAlerts({
    mineId,
    onNewAlert: (payload) => {
      addAlert({
        title: payload.title,
        message: payload.message,
        priority: payload.priority as AlertPriority,
        source: payload.type,
        mineId: payload.mine_id
      })
    }
  })

  useEffect(() => {
    async function fetchAlerts() {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('mine_id', mineId)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (data && data.length > 0) {
        setAlerts(data.map(d => ({
          id: d.id,
          title: d.title,
          message: d.message,
          priority: d.priority || 'info',
          timestamp: d.created_at,
          read: d.read || false,
          source: d.type,
          mineId: d.mine_id
        })))
      } else {
        // Fallback to mocks if no data
        setAlerts([
          { id: '1', title: '[RED] PM10 Breach', priority: 'critical', message: 'Sensor A2 reading 150µg/m³.', timestamp: new Date().toISOString(), read: false },
          { id: '2', title: '[YEL] CLRA Expiring', priority: 'high', message: 'Contractor License expires in 7 days.', timestamp: new Date(Date.now() - 2*3600*1000).toISOString(), read: false },
          { id: '3', title: '[GRN] CAPA Closed', priority: 'low', message: 'Corrective action verified and closed.', timestamp: new Date(Date.now() - 5*3600*1000).toISOString(), read: false },
          { id: '4', title: 'Shift Handover', priority: 'info', message: 'Shift B completed safely.', timestamp: new Date(Date.now() - 24*3600*1000).toISOString(), read: true }
        ])
      }
    }
    fetchAlerts()
  }, [mineId, setAlerts])

  const getAlertIcon = (priority: string) => {
    switch(priority) {
      case 'critical': return <AlertTriangle className="text-red-500 h-5 w-5 shrink-0 mt-0.5" />
      case 'high': return <AlertTriangle className="text-orange-500 h-5 w-5 shrink-0 mt-0.5" />
      case 'medium': return <AlertTriangle className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
      case 'low': return <CheckCircle className="text-slate-500 h-5 w-5 shrink-0 mt-0.5" />
      default: return <Info className="text-blue-500 h-5 w-5 shrink-0 mt-0.5" />
    }
  }

  const getAlertBorder = (priority: string) => {
    switch(priority) {
      case 'critical': return 'border-l-4 border-red-500'
      case 'high': return 'border-l-4 border-orange-500'
      case 'medium': return 'border-l-4 border-amber-500'
      case 'low': return 'border-l-4 border-slate-500'
      default: return 'border-l-4 border-blue-500'
    }
  }

  return (
    <Card className="flex flex-col h-[700px] shadow-sm overflow-hidden relative bg-card">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center rounded-t-lg sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Bell className={`h-5 w-5 text-primary ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
          Live Alert Feed
        </h2>
        {unreadCount > 0 && (
          <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full animate-bounce">
            {unreadCount} New
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 overflow-y-auto h-full overflow-x-hidden">
        <AnimatedList>
          {alerts.map((alert) => (
            <div key={alert.id} className={`flex gap-3 p-3 rounded-md bg-background border shadow-sm ${getAlertBorder(alert.priority)}`}>
              {getAlertIcon(alert.priority)}
              <div>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-foreground">{alert.title}</span>
                  <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                    {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
            </div>
          ))}
        </AnimatedList>
      </div>
    </Card>
  )
}
