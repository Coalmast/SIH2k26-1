import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Info, BellRing, Check, ExternalLink, ShieldAlert, FileWarning } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAlertStore } from '@/stores/alert-store'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

const AIAnalysisPanel = () => (
  <Card className="mb-6 border-l-4 border-l-orange-500 bg-orange-500/5">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-orange-500 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          AI Risk Assessment: HIGH RISK
        </h3>
        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">Score: 61/100</span>
      </div>
      <div className="text-sm text-foreground/80 mb-4">
        <p className="font-semibold text-foreground mb-1">Affected Regulation: EPA 1986, Sch. VI; CMR 2017 Reg. 106</p>
        <p className="mb-4">
          <strong>Executive Summary:</strong> The Environmental Monitoring Inspection submitted on Sept 16, 2026 for Umrer OCP reveals a critical breach of MoEF&CC Environmental Clearance conditions. Respirable Particulate Matter (PM10) was recorded at 4.2 mg/m³, exceeding the stipulated limit of 3.0 mg/m³ by 40%. Sulphur Dioxide (SO2) levels at 2.8 ppm similarly breach the 2.0 ppm threshold. These findings indicate inadequate dust suppression operations and may constitute a violation of EC Condition No. 12 (Dust Control Measures). Immediate corrective action is required to avoid statutory show-cause notice from SPCB.
        </p>
        <p className="font-semibold text-foreground mb-2">Recommended Actions:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Activate all water sprinklers in Section 3 East immediately</li>
          <li>Halt operations in affected zone until PM10 drops below 3.0 mg/m³</li>
          <li>Submit Corrective Action Plan to SPCB within 48 hours (EPA 1986, S.5)</li>
          <li>Conduct re-inspection within 72 hours and document results</li>
          <li>Escalate to District Magistrate if PM10 remains elevated after 24h</li>
        </ul>
      </div>
    </CardContent>
  </Card>
)

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
          { id: '1', title: 'High: PM10 Dust Elevated', priority: 'high', type: 'VIOLATION', message: 'Sensor station near Umrer OCP recorded PM10 levels at 90 µg/m³ (Approaching Limit: 100 µg/m³). Water sprinklers need deployment.', read: false, timestamp: new Date().toISOString() },
          { id: '2', title: 'Contractor Validity Expiring', priority: 'high', type: 'COMPLIANCE', message: 'L&T Mining Services (ID: CON-802) labor license expires in 5 days. Work orders will be automatically paused if not renewed.', read: false, timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
          { id: '3', title: 'Safety Audit Completed', priority: 'low', type: 'INSPECTION', message: 'Q3 Electrical Safety Audit at Block II completed by Inspector Ramesh Kumar. No major non-compliances found.', read: false, timestamp: new Date(Date.now() - 3600000 * 8).toISOString() },
          { id: '4', title: 'Action Required: Machine Maintenance', priority: 'medium', type: 'MAINTENANCE', message: 'Excavator EX-04 has crossed 5,000 operational hours. Preventative maintenance required per DGMS guidelines.', read: true, timestamp: new Date(Date.now() - 86400000).toISOString() },
          { id: '5', title: 'Notice: Groundwater Report Overdue', priority: 'medium', type: 'ESCALATION', message: 'Monthly groundwater withdrawal report for Gevra Project is overdue by 3 days. Please submit to SPCB portal.', read: false, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
          { id: '6', title: 'Production Target Reached', priority: 'low', type: 'INFO', message: 'Weekly coal production target for Sector A achieved 12 hours ahead of schedule.', read: true, timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
          { id: '7', title: 'Upcoming Inspection', priority: 'medium', type: 'REMINDER', message: 'Regulatory inspection by CPCB scheduled for next Tuesday at Dipka OCP.', read: true, timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
        ])
      } else {
        // Map backend alerts to store format
        const mapped = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          message: d.message,
          priority: d.severity,
          type: d.type || 'INFO',
          read: d.is_read,
          timestamp: d.created_at
        }))
        setAlerts(mapped)
      }
    }
    fetchAlerts()

    const channel = supabase.channel('alerts-page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload: any) => {
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

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BellRing className="h-5 w-5 text-primary" />
          Notification Feed
        </h2>
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
                    <h3 className={`font-semibold text-base flex flex-col md:flex-row md:items-center gap-2 ${!alert.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      <div className="flex items-center gap-2">
                        <span className="md:hidden">{getAlertIcon(alert.priority)}</span>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] tracking-wider font-bold">
                          {(alert as any).type || 'INFO'}
                        </Badge>
                      </div>
                      {alert.title}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground/70 whitespace-nowrap ml-4">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{alert.message}</p>
                  
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-4 w-full">
                    {!alert.read && (
                      <Button variant="outline" size="default" className="h-10 px-4 min-w-[120px] text-sm font-medium" onClick={() => markRead(alert.id)}>
                        <Check className="h-4 w-4 mr-2" />{t("acknowledge", "Acknowledge")}</Button>
                    )}
                    {['critical', 'high'].includes(alert.priority) && (
                      <Button variant="outline" size="default" className="h-10 px-4 min-w-[120px] text-sm font-medium text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-500/10" onClick={() => toast.success(t("alert_escalated_successfully", "Alert escalated successfully"))}>
                        <ShieldAlert className="h-4 w-4 mr-2" />{t("escalate", "Escalate")}</Button>
                    )}
                    <Button variant="outline" size="default" className="h-10 px-4 min-w-[120px] text-sm font-medium text-primary border-primary/20 hover:bg-primary/5" onClick={() => toast.success(t("capa_creation_initiated", "CAPA creation initiated"))}>
                      <FileWarning className="h-4 w-4 mr-2" />{t("create_capa", "Create CAPA")}</Button>
                    <Button variant="ghost" size="default" className="h-10 px-4 text-sm text-muted-foreground hover:text-foreground/80 sm:ml-auto w-full sm:w-auto">{t("view_source", "View Source")}<ExternalLink className="h-4 w-4 ml-2" />
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
