import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Shield, Filter, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/admin/audit-log')({
  component: AdminAuditLogPage,
})

const MOCK_LOGS = [
  { id: 'LOG-891', timestamp: '2026-09-14 08:45:12', user: 'System', action: 'CREATE_CAPA', resource: 'CAPA-2026-081', ip: '10.0.4.15' },
  { id: 'LOG-890', timestamp: '2026-09-14 08:40:05', user: 'Dr. A. Verma', action: 'VIEW_REPORT', resource: 'COMPLIANCE_REP_Q3', ip: '117.202.14.9' },
  { id: 'LOG-889', timestamp: '2026-09-13 18:30:22', user: 'Rajesh Kumar', action: 'OVERRIDE_SECURITY', resource: 'GATE_2_ACCESS', ip: '10.0.1.55' },
  { id: 'LOG-888', timestamp: '2026-09-13 14:15:00', user: 'Sneha Patel', action: 'UPDATE_REGULATION', resource: 'REG_104_CMR', ip: '10.0.2.10' },
  { id: 'LOG-887', timestamp: '2026-09-13 09:05:11', user: 'System_IoT', action: 'SENSOR_OFFLINE', resource: 'ENV-204', ip: '10.0.5.201' },
]

function AdminAuditLogPage() {
  const {
    t
  } = useTranslation();

  return (
    <div className="p-4 md:p-8 bg-muted/50 min-h-screen text-foreground">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />{t("system_audit_log", "System Audit Log")}</h1>
            <p className="text-muted-foreground mt-1">{t(
              "immutable_ledger_of_all_system",
              "Immutable ledger of all system actions, access, and modifications."
            )}</p>
          </div>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />{t("export_csv", "Export CSV")}</Button>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <CardTitle className="text-lg">{t("event_history", "Event History")}</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
                  <Input placeholder="Search logs..." className="pl-9 h-9" />
                </div>
                <Button variant="outline" size="sm" className="h-9"><Filter className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left font-mono">
                <thead className="text-xs text-muted-foreground uppercase bg-background text-muted-foreground/50">
                  <tr>
                    <th className="px-6 py-3 font-semibold">{t("timestamp", "Timestamp")}</th>
                    <th className="px-6 py-3 font-semibold">{t("user_system", "User / System")}</th>
                    <th className="px-6 py-3 font-semibold">{t("action", "Action")}</th>
                    <th className="px-6 py-3 font-semibold">{t("target_resource", "Target Resource")}</th>
                    <th className="px-6 py-3 font-semibold">{t("ip_address", "IP Address")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-background">
                  {MOCK_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-3 text-muted-foreground">{log.timestamp}</td>
                      <td className="px-6 py-3 font-semibold text-foreground">{log.user}</td>
                      <td className="px-6 py-3">
                        <Badge variant="outline" className={`font-mono text-[10px] ${log.action.includes('OVERRIDE') || log.action.includes('OFFLINE') ? 'bg-[#f6465d]/10 text-comet-down border-[#f6465d]/30' : 'bg-muted text-foreground/80'}`}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-blue-600">{log.resource}</td>
                      <td className="px-6 py-3 text-muted-foreground/70">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="h-3 w-3" />{t(
              "blockchain_synchronization_act",
              "Blockchain synchronization active. Logs cannot be tampered with."
            )}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
