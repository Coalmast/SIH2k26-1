import { useTranslation } from "react-i18next";
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { ShieldCheck, Search, Filter, ShieldAlert, FileSignature, CheckCircle2, AlertOctagon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Mock Data
const subsidiaries = ['ECL', 'BCCL', 'CCL', 'MCL', 'NCL', 'SECL', 'WCL', 'NEC']
const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`)

// Generate mock heatmap data (0 = safe, 100 = critical risk)
const heatmapData = subsidiaries.reduce((acc, sub) => {
  acc[sub] = weeks.map(() => Math.floor(Math.random() * 100))
  return acc
}, {} as Record<string, number[]>)

const violationsData = [
  { name: 'Environmental', value: 124, color: '#10b981' }, // Emerald
  { name: 'Machinery/Safety', value: 310, color: '#ef4444' }, // Red
  { name: 'Labour', value: 85, color: '#f59e0b' }, // Amber
  { name: 'Production', value: 42, color: '#3b82f6' }, // Blue
]

const blockchainLedger = [
  { id: 'RPT-8991', time: '10:42 AM', mine: 'MIN-042', inspector: 'S. Sharma', hash: '0x8f3c...2a1b', status: 'verified' },
  { id: 'RPT-8990', time: '09:15 AM', mine: 'MIN-089', inspector: 'R. Singh', hash: '0x4b1e...9c8f', status: 'pending' },
  { id: 'RPT-8989', time: '08:30 AM', mine: 'MIN-102', inspector: 'A. Patel', hash: '0x22df...77e1', status: 'verified' },
  { id: 'RPT-8988', time: 'Yesterday', mine: 'MIN-033', inspector: 'M. Kumar', hash: '0x99ac...11bb', status: 'verified' },
]

export function RegulatorDashboard() {
  const {
    t
  } = useTranslation();

  const [verifying, setVerifying] = useState<string | null>(null)

  const handleVerify = (id: string) => {
    setVerifying(id)
    setTimeout(() => setVerifying(null), 1500) // Fake verification delay
  }

  const getHeatmapColor = (score: number) => {
    if (score < 20) return 'bg-emerald-500/20 text-emerald-700'
    if (score < 40) return 'bg-yellow-400/20 text-yellow-700'
    if (score < 60) return 'bg-orange-400/20 text-orange-700'
    if (score < 80) return 'bg-red-500/20 text-red-700'
    return 'bg-red-600 text-white font-bold' // Critical risk
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background min-h-screen text-foreground w-full space-y-6">

      {/* Header & Filter Ribbon */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-foreground">
            <ShieldAlert className="h-8 w-8 text-primary" />{t("dgms_regulatory_forensic_dashb", "DGMS Regulatory Forensic Dashboard")}</h1>
          <p className="text-muted-foreground mt-1">{t(
            "stark_monochrome_view_for_regu",
            "Stark monochrome view for regulatory oversight, AI risk prediction, and compliance verification."
          )}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-muted/50 border-border">
              <SelectValue placeholder="Subsidiary" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_subsidiaries", "All Subsidiaries")}</SelectItem>
              {subsidiaries.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select defaultValue="cmr2017">
            <SelectTrigger className="w-[180px] bg-muted/50 border-border">
              <SelectValue placeholder="Regulation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cmr2017">{t("cmr_2017", "CMR 2017")}</SelectItem>
              <SelectItem value="epact">{t("ep_act_1986", "EP Act 1986")}</SelectItem>
              <SelectItem value="minesact">{t("mines_act_1952", "Mines Act 1952")}</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none shadow-sm">
            <FileSignature className="h-4 w-4 mr-2" />{t("generate_notice", "Generate Notice")}</Button>
        </div>
      </div>

      {/* AI Risk Matrix Heatmap */}
      <Card className="border-border rounded-none shadow-sm">
        <CardHeader className="bg-muted/50 border-b border-border py-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground/80">{t(
              "ai_risk_prediction_matrix_12_w",
              "AI Risk Prediction Matrix (12-Week Rolling)"
            )}</CardTitle>
            <div className="flex gap-2 text-xs items-center text-muted-foreground">{t("low_risk", "Low Risk")}<div className="w-3 h-3 bg-indigo-50 border border-border"></div>
              <div className="w-3 h-3 bg-indigo-200 border border-border"></div>
              <div className="w-3 h-3 bg-indigo-400 border border-border"></div>
              <div className="w-3 h-3 bg-indigo-600 border border-border"></div>
              <div className="w-3 h-3 bg-indigo-900 border border-border"></div>{t("high_risk", "High Risk")}</div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <TooltipProvider delayDuration={0}>
            <div className="flex">
              {/* Y-Axis Labels */}
              <div className="flex flex-col gap-1 pr-4 pt-6">
                {subsidiaries.map(sub => (
                  <div key={sub} className="h-6 flex items-center text-xs font-mono font-bold text-muted-foreground w-12">{sub}</div>
                ))}
              </div>
              
              {/* Heatmap Grid */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-1 mb-2">
                  {weeks.map(w => (
                    <div key={w} className="flex-1 flex justify-center text-[10px] text-muted-foreground/70 font-mono">{w}</div>
                  ))}
                </div>
                <div className="flex flex-col gap-1">
                  {subsidiaries.map(sub => (
                    <div key={sub} className="flex gap-1">
                      {heatmapData[sub].map((score, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <div 
                              className={`flex-1 h-6 cursor-pointer border border-border transition-all hover:ring-2 hover:ring-indigo-500 ${getHeatmapColor(score)}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="font-mono text-xs border-indigo-900 bg-background text-foreground">
                            <strong>{sub} - {weeks[i]}</strong>
                            <br/>{t("ai_risk_score", "AI Risk Score:")}{score}{t("100", "/100")}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Blockchain Ledger */}
        <Card className="lg:col-span-2 border-border rounded-none shadow-sm flex flex-col">
          <CardHeader className="bg-muted/50 border-b border-border py-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />{t("blockchain_verification_ledger", "Blockchain Verification Ledger")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("timestamp", "Timestamp")}</th>
                  <th className="px-4 py-3 font-semibold">{t("report_id", "Report ID")}</th>
                  <th className="px-4 py-3 font-semibold">{t("mine_inspector", "Mine / Inspector")}</th>
                  <th className="px-4 py-3 font-semibold">{t("cryptographic_hash", "Cryptographic Hash")}</th>
                  <th className="px-4 py-3 text-right">{t("integrity", "Integrity")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {blockchainLedger.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-muted-foreground">{row.time}</td>
                    <td className="px-4 py-3 font-bold text-indigo-900">{row.id}</td>
                    <td className="px-4 py-3 text-foreground/80">{row.mine} <span className="text-muted-foreground/70">|</span> {row.inspector}</td>
                    <td className="px-4 py-3 text-muted-foreground/70 select-all">{row.hash}</td>
                    <td className="px-4 py-3 text-right">
                      {row.status === 'verified' && verifying !== row.id ? (
                        <Badge variant="outline" className="rounded-none bg-[#0ecb81]/10 text-comet-up border-emerald-300 font-mono uppercase text-[10px]">
                          <CheckCircle2 className="h-3 w-3 mr-1" />{t("verified", "Verified")}</Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-[10px] rounded-none uppercase font-bold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                          onClick={() => handleVerify(row.id)}
                          disabled={verifying === row.id}
                        >
                          {verifying === row.id ? 'Computing...' : 'Verify Hash'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Violation Distribution */}
        <Card className="border-border rounded-none shadow-sm">
          <CardHeader className="bg-muted/50 border-b border-border py-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground/80">{t("statutory_violations", "Statutory Violations")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={violationsData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {violationsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '0', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '12px' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
