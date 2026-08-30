import { AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function LiveAlertFeed() {
  return (
    <Card className="flex flex-col h-[700px] shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center rounded-t-lg sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary animate-pulse" />
          Live Alert Feed
        </h2>
      </div>
      <div className="p-4 flex flex-col gap-3 overflow-y-auto h-full">
        {/* Red Alert */}
        <div className="flex gap-3 p-3 rounded-md bg-card border-l-4 border-red-500 border shadow-sm">
          <AlertTriangle className="text-red-500 h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-sm text-foreground">[RED] PM10 Breach</span>
              <span className="text-[10px] text-muted-foreground">Just now</span>
            </div>
            <p className="text-xs text-muted-foreground">Sensor A2 reading 150µg/m³. Exceeds permissible limit. Immediate action required.</p>
          </div>
        </div>
        
        {/* Yellow Alert */}
        <div className="flex gap-3 p-3 rounded-md bg-card border-l-4 border-primary border shadow-sm">
          <AlertTriangle className="text-primary h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-sm text-foreground">[YEL] CLRA Expiring</span>
              <span className="text-[10px] text-muted-foreground">2h ago</span>
            </div>
            <p className="text-xs text-muted-foreground">Contractor License (ID: 4492) expires in 7 days.</p>
          </div>
        </div>
        
        {/* Green Alert */}
        <div className="flex gap-3 p-3 rounded-md bg-card border-l-4 border-emerald-500 border shadow-sm">
          <CheckCircle className="text-emerald-500 h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-sm text-foreground">[GRN] CAPA Closed</span>
              <span className="text-[10px] text-muted-foreground">5h ago</span>
            </div>
            <p className="text-xs text-muted-foreground">Corrective action for Incident #1102 verified and closed.</p>
          </div>
        </div>
        
        {/* Neutral Alert */}
        <div className="flex gap-3 p-3 rounded-md bg-card border-l-4 border-muted-foreground border shadow-sm">
          <Info className="text-muted-foreground h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-sm text-foreground">Shift Handover</span>
              <span className="text-[10px] text-muted-foreground">Yesterday</span>
            </div>
            <p className="text-xs text-muted-foreground">Shift B completed safely. No major incidents reported.</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
