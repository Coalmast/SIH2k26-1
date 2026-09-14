import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Info, BellRing, Check, ExternalLink, ShieldAlert, FileWarning } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAlertStore } from '@/stores/alert-store'

export function AlertsPage() {
  const {
    t
  } = useTranslation();

  const { alerts, setAlerts, markRead, markAllRead } = useAlertStore()
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchAlerts() {
      const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false })
      
      if (!data || data.length === 0) {
        setAlerts([
          { id: '1', title: '[RED] PM10 Breach', priority: 'critical', message: 'Sensor A2 reading 150µg/m³.', read: false, timestamp: new Date().toISOString() },
          { id: '2', title: '[YEL] CLRA Expiring', priority: 'high', message: 'Contractor License expires in 7 days.', read: false, timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: '3', title: '[GRN] CAPA Closed', priority: 'low', message: 'Corrective action verified.', read: true, timestamp: new Date(Date.now() - 86400000).toISOString() },
        ])
      } else {
        // Map backend alerts to store format
        const mapped = data.map(d => ({
          id: d.id,
          title: d.title,
          message: d.message,
          priority: d.severity,
          read: d.is_read,
          timestamp: d.created_at
        }))
        setAlerts(mapped)
      }
    }
    fetchAlerts()

    const channel = supabase.channel('alerts-page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, payload => {
        const newAlert = payload.new
        useAlertStore.getState().addAlert({
          title: newAlert.title,
          message: newAlert.message,
          priority: newAlert.severity
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [setAlerts])

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread') return !a.read
    if (filter !== 'all') return a.priority === filter
    return true
  })

  const getAlertIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <AlertTriangle className="text-comet-down h-6 w-6" />
      case 'high': return <AlertTriangle className="text-orange-500 h-6 w-6" />
      case 'medium': return <AlertTriangle className="text-amber-500 h-6 w-6" />
      case 'low': return <CheckCircle className="text-comet-up h-6 w-6" />
      default: return <Info className="text-blue-500 h-6 w-6" />
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/30 max-w-[1200px] mx-auto w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <BellRing className="h-8 w-8 text-primary" />{t("alerts_center", "Alerts Center")}</h1>
          <p className="text-muted-foreground mt-1">{t(
            "manage_realtime_notifications_",
            "Manage realtime notifications and system alerts."
          )}</p>
        </div>
        <Button variant="outline" onClick={markAllRead}>
          <Check className="h-4 w-4 mr-2" />{t("mark_all_as_read", "Mark all as read")}</Button>
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
          <div className="text-center py-12 text-muted-foreground">{t("no_alerts_found", "No alerts found.")}</div>
        ) : (
          filteredAlerts.map(alert => (
            <Card key={alert.id} className={`shadow-sm transition-all ${!alert.read ? 'bg-background border-l-4 border-primary' : 'bg-muted/50 opacity-70'}`}>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-start gap-4">
                <div className="mt-1 hidden md:block">
                  {getAlertIcon(alert.priority)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold text-base flex items-center gap-2 ${!alert.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      <span className="md:hidden">{getAlertIcon(alert.priority)}</span>
                      {alert.title}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground/70 whitespace-nowrap ml-4">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{alert.message}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {!alert.read && (
                      <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => markRead(alert.id)}>
                        <Check className="h-3 w-3 mr-1" />{t("acknowledge", "Acknowledge")}</Button>
                    )}
                    {['critical', 'high'].includes(alert.priority) && (
                      <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-amber-600 border-amber-200 hover:bg-amber-50">
                        <ShieldAlert className="h-3 w-3 mr-1" />{t("escalate", "Escalate")}</Button>
                    )}
                    <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-primary border-primary/20 hover:bg-primary/5">
                      <FileWarning className="h-3 w-3 mr-1" />{t("create_capa", "Create CAPA")}</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs px-2 text-muted-foreground hover:text-foreground/80 ml-auto">{t("view_source", "View Source")}<ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
