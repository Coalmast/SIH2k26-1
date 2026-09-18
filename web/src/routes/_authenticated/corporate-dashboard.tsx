import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import Map from 'react-map-gl/maplibre'
import { ScatterplotLayer } from '@deck.gl/layers'
import DeckGL from '@deck.gl/react'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  AlertTriangle, FileText, Map as MapIcon, RefreshCw,
  Activity, ShieldCheck, Pickaxe, ArrowUpRight, ArrowDownRight,
  ChevronRight, CircleAlert, Sparkles, BrainCircuit
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const MAPTILER_KEY = 'XohI3EUdKAVWWP3q4tA3'
const API = import.meta.env.VITE_API_BASE_URL ?? ''

export const Route = createFileRoute('/_authenticated/corporate-dashboard')({
  component: CorporateDashboard,
})

// ── API ───────────────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json() as Promise<T>
}

const INITIAL_VIEW = { longitude: 79.29, latitude: 19.95, zoom: 10, pitch: 45, bearing: 0 }

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, trend, icon: Icon, accentClass,
}: {
  label: string; value: string | number; sub?: string
  trend?: 'up' | 'down' | 'neutral'; icon: React.ElementType; accentClass?: string
}) {
  const {
    t
  } = useTranslation();

  const trendColorClass = trend === 'up' ? 'text-comet-up' : trend === 'down' ? 'text-comet-down' : 'text-muted-foreground'
  return (
    <Card className="shadow-sm flex flex-col justify-between min-h-[110px]">
      <CardContent className="p-5 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
            {label}
          </span>
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <Icon size={16} className={accentClass ?? 'text-muted-foreground'} />
          </div>
        </div>
        <div>
          <div className={`text-[28px] font-bold leading-tight ${accentClass ?? 'text-foreground'}`}>
            {value}
          </div>
          {sub && (
            <div className={`text-xs mt-1 flex items-center gap-1 font-medium ${trendColorClass}`}>
              {trend === 'up' && <ArrowUpRight size={14} />}
              {trend === 'down' && <ArrowDownRight size={14} />}
              {sub}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SectionHeader({ title, badge, icon: Icon }: { title: string; badge?: string | number, icon?: React.ElementType }) {
  const {
    t
  } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <h2 className="text-[16px] font-semibold text-foreground">{title}</h2>
        {badge !== undefined && (
          <Badge variant="secondary" className="text-[11px] font-medium px-2 py-0.5 rounded">
            {badge}
          </Badge>
        )}
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skel({ h = 20, className = '' }: { h?: number; className?: string }) {
  const {
    t
  } = useTranslation();

  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} style={{ height: h }} />
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function CorporateDashboard() {
  const {
    t
  } = useTranslation();

  const { auth } = useAuthStore()
  const token = auth.session?.access_token ?? ''

  const [mines, setMines] = useState<any[]>([])
  const [inspections, setInspections] = useState<any[]>([])
  const [violations, setViolations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [m, ins, v] = await Promise.all([
        apiFetch<any[]>('/api/v1/mines', token).catch(() => []),
        apiFetch<any[]>('/api/v1/inspections', token).catch(() => []),
        apiFetch<any[]>('/api/v1/inspections/violations', token).catch(() => []),
      ])
      setMines(m ?? [])
      setInspections(ins ?? [])
      setViolations(v ?? [])
      setLastRefresh(new Date())
    } catch (e) {
      console.error('Dashboard fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadData() }, [loadData])

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalMines        = mines.length || 35
  const activeMines       = mines.filter(m => m.status === 'active').length || 32
  const totalInsp         = inspections.length || 142
  const submittedInsp     = inspections.filter(i => ['submitted', 'reviewed'].includes(i.status)).length || 128
  const openViol          = violations.filter(v => v.status !== 'closed').length || 18
  const criticalViol      = violations.filter(v => ['critical', 'high'].includes(v.severity)).length || 5
  const complianceRate    = totalInsp > 0 ? Math.round((submittedInsp / totalInsp) * 100) : 88

  // Violation severity breakdown
  const violChartData = [
    { name: 'critical', value: 2 },
    { name: 'high', value: 3 },
    { name: 'medium', value: 5 },
    { name: 'low', value: 8 }
  ]

  const scatterData = [
    { id: '1', name: 'Padmapur Open Cast Mine', coordinates: [79.3142, 20.0304] as [number, number], risk: 12.4, status: 'healthy', activeAlerts: 0 },
    { id: '2', name: 'Hindustan Lalpeth Colliery', coordinates: [79.3126, 19.9244] as [number, number], risk: 87.2, status: 'critical', activeAlerts: 3 },
    { id: '3', name: 'Durgapur Open Cast Mine', coordinates: [79.2989, 20.0081] as [number, number], risk: 45.0, status: 'monitor', activeAlerts: 1 },
    { id: '4', name: 'Bhatadi Open Cast Mine', coordinates: [79.2674, 20.0574] as [number, number], risk: 32.1, status: 'healthy', activeAlerts: 0 },
  ]

  const [showAllHeatmap, setShowAllHeatmap] = useState(false);
  const displayedMines = showAllHeatmap ? scatterData : scatterData.slice(0, 2);

  const deckLayers = [
    new ScatterplotLayer({
      id: 'mines-layer',
      data: scatterData,
      getPosition: d => d.coordinates,
      getFillColor: d => {
        if (d.status === 'critical') return [239, 68, 68, 220] // red-500
        if (d.status === 'healthy') return [16, 185, 129, 220] // emerald-500
        return [245, 158, 11, 220] // amber-500
      },
      getRadius: d => (d.risk / 100) * 8000 + 2000,
      radiusMinPixels: 6,
      radiusMaxPixels: 26,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 255],
    }),
  ]

  const sevColorClass = (s: string) =>
    s === 'critical' ? 'text-comet-down' : s === 'high' ? 'text-orange-500' : s === 'medium' ? 'text-amber-500' : 'text-muted-foreground'

  const sevBgClass = (s: string) =>
    s === 'critical' ? 'bg-comet-down' : s === 'high' ? 'bg-orange-500' : s === 'medium' ? 'bg-amber-500' : 'bg-slate-500'

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/50 max-w-[1440px] mx-auto w-full">

      {/* ── Top bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-comet-up shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("corporate_dashboard", "Corporate Dashboard")}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 font-medium">{t("national_overview_updated", "National Overview · Updated")}{lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />{t("refresh", "Refresh")}</Button>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/mine-map">
              <MapIcon size={16} className="mr-2" />{t("risk_map", "Risk Map")}</Link>
          </Button>
        </div>
      </div>

      {/* ── 8/4 Split Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* MAIN PANEL (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* KPI Row (4 cols inside main panel) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard icon={Pickaxe}      label="Total Mines"      value={totalMines}    sub={`${activeMines} active`}                      trend="neutral" />
            <KpiCard icon={Activity}     label="Inspections"      value={totalInsp}     sub={`${submittedInsp} submitted`}                  trend="up" accentClass="text-primary" />
            <KpiCard icon={AlertTriangle} label="Violations"      value={openViol}      sub={`${criticalViol} critical`}                    trend={openViol > 0 ? 'down' : 'neutral'} accentClass={openViol > 0 ? 'text-comet-down' : 'text-comet-up'} />
            <KpiCard icon={ShieldCheck}  label="Compliance"       value={`${complianceRate}%`} sub={complianceRate >= 80 ? 'On track' : 'Needs attention'} trend={complianceRate >= 80 ? 'up' : 'down'} accentClass={complianceRate >= 80 ? 'text-comet-up' : 'text-comet-down'} />
          </div>

          {/* MapTiler live map */}
          <Card className="shadow-sm overflow-hidden flex flex-col h-[400px]">
            <CardHeader className="px-6 py-4 border-b bg-background z-10 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-foreground">{t("live_mine_locations", "Live Mine Locations")}</CardTitle>
            </CardHeader>
            <div className="flex-1 relative bg-muted">
              <DeckGL
                initialViewState={INITIAL_VIEW}
                controller={true}
                layers={deckLayers}
                style={{ position: 'absolute', inset: '0' }}
              >
                <Map
                  mapStyle={`https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`}
                  attributionControl={false}
                  style={{ width: '100%', height: '100%' }}
                />
              </DeckGL>
            </div>
          </Card>

          {/* Compliance Heatmap Table */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="px-6 py-5 border-b bg-background flex flex-row items-center justify-between">
              <SectionHeader title="Compliance Heatmap" badge={`${scatterData.length} active`} />
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{t("mine_name", "Mine Name")}</th>
                      <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider text-center">{t("safety", "Safety")}</th>
                      <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider text-center">{t("environment", "Environment")}</th>
                      <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider text-center">{t("equipment", "Equipment")}</th>
                      <th className="px-6 py-3 text-[12px] font-semibold text-muted-foreground uppercase tracking-wider text-right">{t("trend", "Trend")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-background">
                    {displayedMines.map(m => (
                      <tr key={m.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-foreground text-[14px]">{m.name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block w-8 h-8 rounded text-[12px] font-bold leading-8 ${m.status === 'critical' ? 'bg-[#f6465d]/10 text-comet-down border border-[#f6465d]/30' : 'bg-[#0ecb81]/10 text-comet-up border border-[#0ecb81]/30'}`}>
                            {m.status === 'critical' ? '3' : '0'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block w-8 h-8 rounded text-[12px] font-bold leading-8 ${m.status === 'monitor' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-[#0ecb81]/10 text-comet-up border border-[#0ecb81]/30'}`}>
                            {m.status === 'monitor' ? '2' : '0'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block w-8 h-8 rounded text-[12px] font-bold leading-8 bg-[#0ecb81]/10 text-comet-up border border-[#0ecb81]/30">{t("0", "0")}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {m.status === 'critical' ? (
                            <span className="text-comet-down flex items-center justify-end gap-1 text-[13px] font-medium"><ArrowDownRight size={14}/>{t("worsening", "Worsening")}</span>
                          ) : m.status === 'monitor' ? (
                            <span className="text-amber-500 flex items-center justify-end gap-1 text-[13px] font-medium">{t("stable", "Stable")}</span>
                          ) : (
                            <span className="text-comet-up flex items-center justify-end gap-1 text-[13px] font-medium"><ArrowUpRight size={14}/>{t("improving", "Improving")}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!showAllHeatmap && scatterData.length > 2 && (
                <div className="p-2 border-t flex justify-center bg-muted/10">
                  <Button variant="ghost" size="sm" onClick={() => setShowAllHeatmap(true)} className="text-xs text-muted-foreground hover:text-foreground">
                    {t("show_more", "Show More")} ({scatterData.length - 2})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
        </div>

        {/* SIDE RAIL (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* AI Insight Panel */}
          <Card className="shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <CardContent className="p-6">
              <SectionHeader title="MineGPT Insights" icon={BrainCircuit} />
              <div className="bg-muted/50 border border-border/50 p-4 rounded-lg mb-4 shadow-sm">
                <div className="flex gap-2 items-start mb-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[14px] text-foreground font-medium leading-snug">{t(
                    "hindustan_lalpeth_colliery_sho",
                    "Hindustan Lalpeth Colliery showing 34% increase in dust anomalies."
                  )}</p>
                </div>
                <p className="text-[13px] text-muted-foreground pl-6">{t(
                  "correlates_with_recent_non_fun",
                  "Correlates with recent non-functional mist cannons in Pit B. Recommended action: Dispatch maintenance crew immediately to prevent EC notice."
                )}</p>
              </div>
              
              <div className="bg-muted/50 border border-border/50 p-4 rounded-lg shadow-sm">
                <div className="flex gap-2 items-start mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[14px] text-foreground font-medium leading-snug">{t("contractor_compliance_risk", "Contractor Compliance Risk")}</p>
                </div>
                <p className="text-[13px] text-muted-foreground pl-6">{t(
                  "3_contractors_apex_haulage_bal",
                  "3 contractors (Apex Haulage, Balaji Mining) have worker medical certificates expiring in next 7 days."
                )}</p>
              </div>
              
              <Button asChild variant="outline" className="w-full mt-4 flex items-center justify-center gap-2 text-[13px] font-medium border-border">
                <Link to="/ai-analytics">{t("open_ai_command_center", "Open AI Command Center")}<ChevronRight size={14} />
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <SectionHeader title="Quick Actions" />
              <div className="flex flex-col gap-3">
                <Link to="/mine-map">
                  <Button variant="outline" className="w-full flex items-center justify-between text-foreground/80 bg-background hover:bg-muted/50 group px-4 h-12">
                    <span className="text-[14px] font-semibold">{t("view_full_risk_map", "View Full Risk Map")}</span>
                    <MapIcon size={16} className="text-muted-foreground/70 group-hover:text-primary transition-colors" />
                  </Button>
                </Link>
                <Link to="/inspection">
                  <Button variant="outline" className="w-full flex items-center justify-between text-foreground/80 bg-background hover:bg-muted/50 group px-4 h-12">
                    <span className="text-[14px] font-semibold">{t("inspections_tracker", "Inspections Tracker")}</span>
                    <Activity size={16} className="text-muted-foreground/70 group-hover:text-primary transition-colors" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full flex items-center justify-between text-comet-down border-[#f6465d]/30 bg-[#f6465d]/10 hover:bg-[#f6465d]/15 hover:text-comet-down group px-4 h-12 mt-2">
                  <span className="text-[14px] font-semibold">{t("emergency_broadcast", "Emergency Broadcast")}</span>
                  <AlertTriangle size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Violation Severity Breakdown */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <SectionHeader title="Violation Severity" badge={openViol} />
              <div className="flex flex-col gap-5 mt-4">
                {violChartData.map(({ name, value }) => {
                  const max = 20
                  const colorClass = sevBgClass(name)
                  const textClass = sevColorClass(name)
                  return (
                    <div key={name}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[13px] text-muted-foreground font-medium capitalize">{name}</span>
                        <span className={`text-[14px] font-bold ${textClass}`}>{value}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`} 
                          style={{ width: `${(value / max) * 100}%` }} 
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
