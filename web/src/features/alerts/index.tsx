import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Info, BellRing, Check, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchAlerts() {
      const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false })
      
      // Fallback mocks if table empty or doesn't exist
      if (!data || data.length === 0) {
        setAlerts([
          { id: '1', title: '[RED] PM10 Breach', severity: 'critical', message: 'Sensor A2 reading 150µg/m³.', is_read: false, created_at: new Date().toISOString() },
          { id: '2', title: '[YEL] CLRA Expiring', severity: 'high', message: 'Contractor License expires in 7 days.', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: '3', title: '[GRN] CAPA Closed', severity: 'low', message: 'Corrective action verified.', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
        ])
      } else {
        setAlerts(data)
      }
    }
    fetchAlerts()

    const channel = supabase.channel('alerts-page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, payload => {
        setAlerts(current => [payload.new, ...current])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const markAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, is_read: true })))
    // TODO: supabase.from('alerts').update({ is_read: true }).neq('id', '0')
  }

  const markRead = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: true } : a))
    // TODO: supabase.from('alerts').update({ is_read: true }).eq('id', id)
  }

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread') return !a.is_read
    if (filter !== 'all') return a.severity === filter
    return true
  })

  const getAlertIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="text-red-500 h-6 w-6" />
      case 'high': return <AlertTriangle className="text-orange-500 h-6 w-6" />
      case 'low': return <CheckCircle className="text-emerald-500 h-6 w-6" />
      default: return <Info className="text-blue-500 h-6 w-6" />
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 max-w-[1200px] mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <BellRing className="h-8 w-8 text-primary" />
            Alerts Center
          </h1>
          <p className="text-muted-foreground mt-1">Manage realtime notifications and system alerts.</p>
        </div>
        <Button variant="outline" onClick={markAllRead}>
          <Check className="h-4 w-4 mr-2" /> Mark all as read
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'unread', 'critical', 'high', 'low'].map(f => (
          <Button 
            key={f} 
            variant={filter === f ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No alerts found.
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <Card key={alert.id} className={`shadow-sm transition-all ${!alert.is_read ? 'bg-white border-l-4 border-primary' : 'bg-slate-50 opacity-70'}`}>
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="mt-1">
                  {getAlertIcon(alert.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold text-base ${!alert.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                      {alert.title}
                    </h3>
                    <span className="text-xs font-medium text-slate-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{alert.message}</p>
                  
                  <div className="flex gap-3">
                    {!alert.is_read && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => markRead(alert.id)}>
                        Mark as read
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-primary">
                      View details <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
