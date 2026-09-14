import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts'
import { Server, Activity, HardDrive, Cpu, AlertTriangle, Download, RefreshCw, Terminal as TerminalIcon } from 'lucide-react'
import { Terminal, TypingAnimation } from '@/components/ui/terminal'
import { NumberTicker } from '@/components/ui/number-ticker'

// Mock Data
const aiPipelineData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  success: Math.floor(Math.random() * 500) + 200,
  failure: Math.floor(Math.random() * 50) + 10,
}))

const syncTrafficData = Array.from({ length: 50 }, () => ({
  x: Math.floor(Math.random() * 24), // Hour of day
  y: Math.floor(Math.random() * 10), // Mine Zone ID
  z: Math.floor(Math.random() * 500) + 50, // Packets
}))

const mockLogs = [
  "[10:42:11] INFO: Main cluster running steadily at 45% CPU",
  "[10:45:02] WARN: Sync queue backlog increasing in Zone 4",
  "[10:48:15] ERROR: OCR Pipeline timeout on Document ID #89921",
  "[10:49:00] INFO: Auto-scaling workers from 12 to 16",
  "[10:50:33] ERROR: Supabase Realtime socket disconnect (Code 1006)",
  "[10:51:01] INFO: Socket reconnected successfully",
]

export function SystemHealthDashboard() {
  const {
    t
  } = useTranslation();

  const [logs, setLogs] = useState<string[]>([])

  // Simulate incoming logs
  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < mockLogs.length) {
        setLogs(prev => [...prev, mockLogs[currentIndex]])
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#1a1a2e] min-h-screen text-slate-200 w-full space-y-6 dark">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-foreground">
            <Server className="h-8 w-8 text-comet-up" />{t("system_admin_ai_ops", "System Admin & AI Ops")}</h1>
          <p className="text-muted-foreground/70 mt-1">{t(
            "real_time_infrastructure_healt",
            "Real-time infrastructure health, pipeline monitoring, and raw error logs."
          )}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-900/30 text-comet-up border-emerald-800 px-3 py-1">
            <span className="flex h-2 w-2 relative mr-2 inline-block">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-comet-up opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-comet-up"></span>
            </span>{t("system_operational", "System Operational")}</Badge>
          <Button variant="outline" className="border-border bg-muted text-slate-200 hover:bg-slate-700 hover:text-foreground">
            <RefreshCw className="h-4 w-4 mr-2" />{t("refresh", "Refresh")}</Button>
        </div>
      </div>

      {/* Vital Signs (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Server Uptime", value: 99.98, unit: "%", icon: Activity, color: "text-comet-up" },
          { title: "API Gateway Latency", value: 42, unit: "ms", icon: Server, color: "text-comet-up" },
          { title: "Blockchain Node", value: "SYNCED", unit: "", icon: Cpu, color: "text-comet-up", noCounter: true },
          { title: "Cloud Storage Used", value: 1.2, unit: "TB", icon: HardDrive, color: "text-amber-400" },
        ].map((stat, i) => (
          <Card key={i} className="bg-background/50 border-border shadow-none">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-muted-foreground/70">{stat.title}</div>
                <div className={`text-3xl font-black mt-1 ${stat.color}`}>
                  {stat.noCounter ? stat.value : <NumberTicker value={stat.value as number} />}
                  <span className="text-lg font-bold ml-1">{stat.unit}</span>
                </div>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI & OCR Pipeline Monitor */}
        <Card className="bg-background/50 border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <CardTitle className="text-lg text-slate-200">{t("ai_digitization_pipeline_24h", "AI Digitization Pipeline (24h)")}</CardTitle>
            <Badge className="bg-fuchsia-900/30 text-fuchsia-400 border border-fuchsia-800">{t("24_queued", "24 Queued")}</Badge>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aiPipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="success" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" name="Success" />
                <Area type="monotone" dataKey="failure" stroke="#d946ef" fillOpacity={1} fill="url(#colorFailure)" name="Failure" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Offline Sync Traffic */}
        <Card className="bg-background/50 border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <CardTitle className="text-lg text-slate-200">{t("mobile_sync_traffic_matrix", "Mobile Sync Traffic Matrix")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" dataKey="x" name="Hour" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 24]} />
                <YAxis type="number" dataKey="y" name="Zone ID" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 10]} />
                <ZAxis type="number" dataKey="z" range={[20, 400]} name="Packets" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                <Scatter name="Sync Packets" data={syncTrafficData} fill="#38bdf8" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Error Logs (Terminal) */}
      <Card className="bg-[#0f172a] border-border shadow-none">
        <CardHeader className="pb-0 pt-4 px-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground/70 font-mono text-xs">
            <TerminalIcon className="h-4 w-4" />{t("root_comet_production_cluster", "root@comet-production-cluster:~")}</div>
          <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground/70 hover:text-foreground">
            <Download className="h-3 w-3 mr-2" />{t("export", "Export")}</Button>
        </CardHeader>
        <CardContent className="p-4">
          <Terminal className="h-[250px] w-full text-xs overflow-y-auto">
            {logs.map((log, i) => (
              <TypingAnimation 
                key={i} 
                className={`text-left font-mono text-xs mb-1 ${
                  log.includes('ERROR') ? 'text-fuchsia-400' : 
                  log.includes('WARN') ? 'text-amber-400' : 
                  'text-comet-up'
                }`}
                duration={10}
              >
                {log}
              </TypingAnimation>
            ))}
            {logs.length === mockLogs.length && (
              <div className="animate-pulse mt-2 text-muted-foreground font-mono">{t("waiting_for_incoming_logs", "_ waiting for incoming logs...")}</div>
            )}
          </Terminal>
        </CardContent>
      </Card>

    </div>
  );
}
