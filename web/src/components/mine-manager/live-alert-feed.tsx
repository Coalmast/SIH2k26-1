import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const INITIAL_MOCKS = [
  { id: '1', title: '[RED] PM10 Breach', severity: 'critical', message: 'Sensor A2 reading 150µg/m³. Exceeds permissible limit. Immediate action required.', created_at: new Date().toISOString() },
  { id: '2', title: '[YEL] CLRA Expiring', severity: 'high', message: 'Contractor License (ID: 4492) expires in 7 days.', created_at: new Date(Date.now() - 2*3600*1000).toISOString() },
  { id: '3', title: '[GRN] CAPA Closed', severity: 'low', message: 'Corrective action for Incident #1102 verified and closed.', created_at: new Date(Date.now() - 5*3600*1000).toISOString() },
  { id: '4', title: 'Shift Handover', severity: 'info', message: 'Shift B completed safely. No major incidents reported.', created_at: new Date(Date.now() - 24*3600*1000).toISOString() }
]

export function LiveAlertFeed() {
  const [alerts, setAlerts] = useState<any[]>(INITIAL_MOCKS)
  const [newAlertCount, setNewAlertCount] = useState(0)

  useEffect(() => {
    async function fetchAlerts() {
      const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(20)
      if (data && data.length > 0) setAlerts(data)
    }
    fetchAlerts()

    const channel = supabase.channel('alerts-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, payload => {
        setAlerts(current => [payload.new, ...current])
        setNewAlertCount(c => c + 1)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getAlertIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="text-red-500 h-5 w-5 shrink-0 mt-0.5" />
      case 'high': return <AlertTriangle className="text-primary h-5 w-5 shrink-0 mt-0.5" />
      case 'low': return <CheckCircle className="text-emerald-500 h-5 w-5 shrink-0 mt-0.5" />
      default: return <Info className="text-muted-foreground h-5 w-5 shrink-0 mt-0.5" />
    }
  }

  const getAlertBorder = (severity: string) => {
    switch(severity) {
      case 'critical': return 'border-l-4 border-red-500'
      case 'high': return 'border-l-4 border-primary'
      case 'low': return 'border-l-4 border-emerald-500'
      default: return 'border-l-4 border-muted-foreground'
    }
  }

  return (
    <Card className="flex flex-col h-[700px] shadow-sm overflow-hidden relative">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center rounded-t-lg sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className={`h-5 w-5 text-primary ${newAlertCount > 0 ? 'animate-pulse' : ''}`} />
          Live Alert Feed
        </h2>
        {newAlertCount > 0 && (
          <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full animate-bounce">
            {newAlertCount} New
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-3 overflow-y-auto h-full">
        {alerts.map((alert, i) => (
          <div key={alert.id || i} className={`flex gap-3 p-3 rounded-md bg-card border shadow-sm ${getAlertBorder(alert.severity)} animate-in fade-in slide-in-from-top-4 duration-500`}>
            {getAlertIcon(alert.severity)}
            <div>
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm text-foreground">{alert.title}</span>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(alert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

