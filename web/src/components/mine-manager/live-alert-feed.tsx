import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Bell, ShieldAlert, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { AnimatedList } from '@/components/ui/animated-list';
import { useAlertStore, type AlertPriority } from '@/stores/alert-store';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { Button } from '@/components/ui/button';

export function LiveAlertFeed({ mineId }: { mineId?: string }) {
  const { t } = useTranslation();
  const { alerts, setAlerts, addAlert, unreadCount, markAllRead } = useAlertStore();
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'info'>('all');

  useRealtimeAlerts({
    mineId: mineId || null,
    onNewAlert: (payload) => {
      addAlert({
        title: payload.title,
        message: payload.message,
        priority: payload.priority as AlertPriority,
        source: payload.type,
        mineId: payload.mine_id
      });
    }
  });

  useEffect(() => {
    if (!mineId) return;

    async function fetchAlerts() {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('mine_id', mineId!)
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (data && data.length > 0) {
        setAlerts(data.map((d: any) => ({
          id: d.id,
          title: d.title,
          message: d.message,
          priority: d.priority || 'info',
          timestamp: d.created_at,
          read: d.read || false,
          source: d.type,
          mineId: d.mine_id
        })));
      }
    }
    fetchAlerts();
  }, [mineId, setAlerts]);

  const getAlertIcon = (priority: string) => {
    switch(priority) {
      case 'critical': return <AlertTriangle className="text-destructive h-5 w-5 shrink-0 mt-0.5" />
      case 'high': return <AlertTriangle className="text-orange-500 h-5 w-5 shrink-0 mt-0.5" />
      case 'medium': return <AlertTriangle className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
      case 'low': return <CheckCircle className="text-muted-foreground h-5 w-5 shrink-0 mt-0.5" />
      default: return <Info className="text-blue-500 h-5 w-5 shrink-0 mt-0.5" />
    }
  }

  const getAlertBorder = (priority: string) => {
    switch(priority) {
      case 'critical': return 'border-l-4 border-destructive glow-critical'
      case 'high': return 'border-l-4 border-orange-500'
      case 'medium': return 'border-l-4 border-amber-500'
      case 'low': return 'border-l-4 border-slate-500'
      default: return 'border-l-4 border-blue-500'
    }
  }

  const filteredAlerts = alerts.filter(a => filter === 'all' || a.priority === filter);

  return (
    <Card className="flex flex-col h-[600px] shadow-sm overflow-hidden relative bg-card card-neon-top">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center rounded-t-lg sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="relative">
             <Bell className="h-5 w-5 text-primary" />
             {unreadCount > 0 && (
               <span className="absolute -top-1 -right-1 flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
               </span>
             )}
          </div>
          {t("live_alert_feed", "Live Alert Feed")}
        </h2>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead()} className="text-xs h-7 px-2 hover:bg-muted">
            <CheckCheck className="h-3 w-3 mr-1" /> {t("mark_read", "Mark Read")}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-3 border-b bg-muted/10">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')} className="h-7 text-xs rounded-full">All</Button>
        <Button variant={filter === 'critical' ? 'destructive' : 'outline'} size="sm" onClick={() => setFilter('critical')} className="h-7 text-xs rounded-full">Critical</Button>
        <Button variant={filter === 'high' ? 'secondary' : 'outline'} size="sm" onClick={() => setFilter('high')} className="h-7 text-xs rounded-full">High</Button>
      </div>

      <div className="p-4 flex flex-col gap-3 overflow-y-auto h-full overflow-x-hidden">
        {filteredAlerts.length === 0 ? (
           <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
             {t("no_alerts", "No active alerts.")}
           </div>
        ) : (
          <AnimatedList>
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={`flex gap-3 p-3 rounded-md bg-card border shadow-sm ${getAlertBorder(alert.priority)}`}>
                {getAlertIcon(alert.priority)}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-foreground leading-tight">{alert.title}</span>
                    <span className="text-[10px] text-muted-foreground ml-2 shrink-0">
                      {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            ))}
          </AnimatedList>
        )}
      </div>
    </Card>
  );
}
