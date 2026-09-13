import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import Map from 'react-map-gl/maplibre'
import { ScatterplotLayer } from '@deck.gl/layers'
import DeckGL from '@deck.gl/react'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  AlertTriangle, FileText, Map as MapIcon, RefreshCw,
  Activity, ShieldCheck, Pickaxe, ArrowUpRight, ArrowDownRight,
  TrendingUp, ChevronRight, Loader2, Target, CircleAlert
} from 'lucide-react'
import { Link as RouterLink } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

// ── Design tokens (Binance-style) ─────────────────────────────────────────────
const T = {
  canvas:   '#0b0e11',
  card:     '#1e2329',
  elevated: '#2b3139',
  hairline: '#2b3139',
  yellow:   '#fcd535',
  up:       '#0ecb81',
  down:     '#f6465d',
  body:     '#eaecef',
  muted:    '#707a8a',
  white:    '#ffffff',
}

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

const STATE_COORDS: Record<string, [number, number]> = {
  'Jharkhand':       [85.3, 23.6],
  'Odisha':          [84.9, 20.9],
  'Chhattisgarh':    [81.7, 21.3],
  'Madhya Pradesh':  [79.0, 22.7],
  'West Bengal':     [87.4, 23.6],
  'Telangana':       [79.5, 17.9],
  'Maharashtra':     [78.8, 20.7],
  'Andhra Pradesh':  [79.7, 14.7],
  '_default':        [79.29, 19.95],
}

// ── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, trend, icon: Icon, accent,
}: {
  label: string; value: string | number; sub?: string
  trend?: 'up' | 'down' | 'neutral'; icon: React.ElementType; accent?: string
}) {
  const trendColor = trend === 'up' ? T.up : trend === 'down' ? T.down : T.muted
  return (
    <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] p-5 flex flex-col justify-between min-h-[110px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#707a8a] tracking-wider uppercase">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-[#2b3139] flex items-center justify-center">
          <Icon size={16} color={accent ?? T.muted} />
        </div>
      </div>
      <div>
        <div className="text-[28px] font-bold leading-tight" style={{ color: accent ?? T.white }}>
          {value}
        </div>
        {sub && (
          <div className="text-xs mt-1 flex items-center gap-1 font-medium" style={{ color: trendColor }}>
            {trend === 'up' && <ArrowUpRight size={14} />}
            {trend === 'down' && <ArrowDownRight size={14} />}
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ title, badge }: { title: string; badge?: string | number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-[16px] font-semibold text-white">{title}</h2>
      {badge !== undefined && (
        <span className="text-[11px] font-medium bg-[#2b3139] text-[#eaecef] px-2 py-0.5 rounded">
          {badge}
        </span>
      )}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skel({ h = 20, className = '' }: { h?: number; className?: string }) {
  return (
    <div className={`animate-pulse bg-[#2b3139] rounded ${className}`} style={{ height: h }} />
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
function CorporateDashboard() {
  const { auth } = useAuthStore()
  const token = auth.session?.access_token ?? ''

  const [mines, setMines] = useState<any[]>([])
  const [inspections, setInspections] = useState<any[]>([])
  const [violations, setViolations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [viewState, setViewState] = useState(INITIAL_VIEW)

  const loadData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [m, ins, v] = await Promise.all([
        apiFetch<any[]>('/api/v1/mines', token),
        apiFetch<any[]>('/api/v1/inspections', token),
        apiFetch<any[]>('/api/v1/inspections/violations', token),
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
  const totalMines        = mines.length
  const activeMines       = mines.filter(m => m.status === 'active').length
  const totalInsp         = inspections.length
  const submittedInsp     = inspections.filter(i => ['submitted', 'reviewed'].includes(i.status)).length
  const openViol          = violations.filter(v => v.status !== 'closed').length
  const criticalViol      = violations.filter(v => ['critical', 'high'].includes(v.severity)).length
  const complianceRate    = totalInsp > 0 ? Math.round((submittedInsp / totalInsp) * 100) : 0

  // Inspection type breakdown
  const inspByType = inspections.reduce<Record<string, number>>((acc, i) => {
    const raw = (i.inspection_type as string) ?? 'unknown'
    const label = raw.replace('dgms_', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, 18)
    acc[label] = (acc[label] ?? 0) + 1
    return acc
  }, {})
  const inspChartData = Object.entries(inspByType).map(([name, count]) => ({ name, count }))

  // Violation severity breakdown
  const violBySev = violations.reduce<Record<string, number>>((acc, v) => {
    const s = v.severity ?? 'unknown'
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  }, {})
  const violChartData = Object.entries(violBySev).map(([name, value]) => ({ name, value }))

  // Trend mock
  const trendData = [
    { month: 'Apr', score: 72 }, { month: 'May', score: 78 }, { month: 'Jun', score: 74 },
    { month: 'Jul', score: 81 }, { month: 'Aug', score: 85 }, { month: 'Sep', score: complianceRate || 88 },
  ]

  // Hardcoded Chandrapur Mines for GIS Map
  const scatterData = [
    { id: '1', name: 'Padmapur Open Cast Mine', coordinates: [79.3142, 20.0304] as [number, number], risk: 12.4, status: 'healthy', activeAlerts: 0 },
    { id: '2', name: 'Hindustan Lalpeth Colliery', coordinates: [79.3126, 19.9244] as [number, number], risk: 87.2, status: 'critical', activeAlerts: 3 },
    { id: '3', name: 'Durgapur Open Cast Mine', coordinates: [79.2989, 20.0081] as [number, number], risk: 45.0, status: 'monitor', activeAlerts: 1 },
    { id: '4', name: 'Bhatadi Open Cast Mine', coordinates: [79.2674, 20.0574] as [number, number], risk: 32.1, status: 'healthy', activeAlerts: 0 },
    { id: '5', name: 'Mana Incline', coordinates: [79.3115, 19.9085] as [number, number], risk: 65.5, status: 'monitor', activeAlerts: 2 },
    {
    "id": "21",
    "name": "Neyveli Lignite Mine-I",
    "coordinates": [79.4826, 11.6042],
    "risk": 24.5,
    "status": "healthy",
    "activeAlerts": 0
  },
  {
    "id": "22",
    "name": "Singrauli Open Cast Mine",
    "coordinates": [82.7042, 24.1958],
    "risk": 41.2,
    "status": "monitor",
    "activeAlerts": 1
  },
  {
    "id": "23",
    "name": "Rajmahal Open Cast Project",
    "coordinates": [87.4682, 25.0214],
    "risk": 58.7,
    "status": "monitor",
    "activeAlerts": 2
  },
  {
    "id": "24",
    "name": "Korba Coalfield",
    "coordinates": [82.7306, 22.3583],
    "risk": 33.1,
    "status": "healthy",
    "activeAlerts": 0
  },
  {
    "id": "25",
    "name": "Ib Valley Coalfield",
    "coordinates": [83.8711, 21.7486],
    "risk": 47.4,
    "status": "monitor",
    "activeAlerts": 1
  },
  {
    "id": "26",
    "name": "Ramagundam Open Cast Project III",
    "coordinates": [79.4892, 18.7361],
    "risk": 29.8,
    "status": "healthy",
    "activeAlerts": 0
  },
  {
    "id": "27",
    "name": "Bokaro Thermal Coal Mine",
    "coordinates": [85.9741, 23.7744],
    "risk": 82.3,
    "status": "critical",
    "activeAlerts": 3
  },
  {
    "id": "28",
    "name": "Piparwar Open Cast Project",
    "coordinates": [85.0422, 23.6847],
    "risk": 36.5,
    "status": "healthy",
    "activeAlerts": 0
  },
  {
    "id": "29",
    "name": "Lakhanpur Open Cast Mine",
    "coordinates": [83.8214, 21.7836],
    "risk": 19.2,
    "status": "healthy",
    "activeAlerts": 0
  },
  {
    "id": "30",
    "name": "Karanpura Coalfield",
    "coordinates": [85.2317, 23.8412],
    "risk": 64.1,
    "status": "monitor",
    "activeAlerts": 2
  },
  {
    "id": "31",
    "name": "Manuguru Coal Mine",
    "coordinates": [80.7428, 17.9894],
    "risk": 31.4,
    "status": "healthy",
    "activeAlerts": 0
  },
  {
    "id": "32",
    "name": "Chirimiri Colliery",
    "coordinates": [82.3572, 23.1894],
    "risk": 71.9,
    "status": "critical",
    "activeAlerts": 3
  },
  {
    "id": "33",
    "name": "Wardha Valley Coalfield",
    "coordinates": [79.2844, 19.9575],
    "risk": 49.6,
    "status": "monitor",
    "activeAlerts": 1
  },
  {
    "id": "34",
    "name": "Umred Open Cast Mine",
    "coordinates": [79.3147, 20.8719],
    "risk": 15.8,
    "status": "healthy",
    "activeAlerts": 0
  },
  {
    "id": "35",
    "name": "Raniganj Coalfield",
    "coordinates": [87.1147, 23.6189],
    "risk": 86.4,
    "status": "critical",
    "activeAlerts": 4
  }
  ]

  const deckLayers = [
    new ScatterplotLayer({
      id: 'mines-layer',
      data: scatterData,
      getPosition: d => d.coordinates,
      getFillColor: d => {
        if (d.status === 'critical') return [246, 70, 93, 220] // Binance Red
        if (d.status === 'healthy') return [14, 203, 129, 220] // Binance Green
        return [252, 213, 53, 220] // Binance Yellow
      },
      getRadius: d => (d.risk / 100) * 8000 + 2000,
      radiusMinPixels: 6,
      radiusMaxPixels: 26,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 255],
    }),
  ]

  const sevColor = (s: string) =>
    s === 'critical' ? T.down : s === 'high' ? '#f97316' : s === 'medium' ? '#f59e0b' : T.muted

  return (
    <div className="min-h-screen font-sans bg-[#0b0e11] text-[#eaecef] pb-12">
      <div className="max-w-[1440px] mx-auto px-6 pt-6">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#0ecb81] shadow-[0_0_8px_#0ecb81]" />
              <h1 className="text-[24px] font-bold text-white tracking-tight">Coal Operations Control</h1>
            </div>
            <p className="text-[13px] text-[#707a8a] mt-1 font-medium">
              Corporate & Subsidiary · Live · Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 bg-[#1e2329] border border-[#2b3139] hover:bg-[#2b3139] text-[#eaecef] rounded-md px-4 py-2 text-[14px] font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link to="/mine-map">
              <button className="flex items-center gap-2 bg-[#fcd535] hover:bg-[#f0b90b] text-[#181a20] rounded-md px-5 py-2 text-[14px] font-bold transition-colors">
                <MapIcon size={16} />
                Risk Map
              </button>
            </Link>
          </div>
        </div>

        {/* ── 8/4 Split Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MAIN PANEL (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* KPI Row (4 cols inside main panel) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-[#1e2329] rounded-xl border border-[#2b3139] p-5 h-[110px]">
                    <Skel h={14} className="w-16 mb-4" />
                    <Skel h={28} className="w-12" />
                  </div>
                ))
              ) : (
                <>
                  <KpiCard icon={Pickaxe}      label="Total Mines"      value={totalMines}    sub={`${activeMines} active`}                      trend="neutral" />
                  <KpiCard icon={Activity}     label="Inspections"      value={totalInsp}     sub={`${submittedInsp} submitted`}                  trend="up" accent={T.yellow} />
                  <KpiCard icon={AlertTriangle} label="Violations"      value={openViol}      sub={`${criticalViol} critical`}                    trend={openViol > 0 ? 'down' : 'neutral'} accent={openViol > 0 ? T.down : T.up} />
                  <KpiCard icon={ShieldCheck}  label="Compliance"       value={`${complianceRate}%`} sub={complianceRate >= 80 ? 'On track' : 'Needs attention'} trend={complianceRate >= 80 ? 'up' : 'down'} accent={complianceRate >= 80 ? T.up : T.down} />
                </>
              )}
            </div>

            {/* MapTiler live map */}
            <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] overflow-hidden flex flex-col h-[400px]">
              <div className="px-6 py-4 border-b border-[#2b3139] flex items-center justify-between bg-[#1e2329] z-10">
                <span className="text-[16px] font-semibold text-white">Live Mine Locations</span>
                <Link to="/mine-map" className="text-[13px] font-medium text-[#fcd535] hover:underline">
                  Open full map →
                </Link>
              </div>
              <div className="flex-1 relative">
                {loading ? (
                  <Skel h={340} className="rounded-none" />
                ) : (
                  <DeckGL
                    initialViewState={INITIAL_VIEW}
                    controller={true}
                    layers={deckLayers}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    <Map
                      mapStyle={`https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`}
                      attributionControl={false}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </DeckGL>
                )}
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Compliance Trend */}
              <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] p-6">
                <SectionHeader title="Compliance Trend" badge={`${complianceRate}%`} />
                <div className="h-[200px]">
                  {loading ? <Skel h={200} /> : (
                    <ChartContainer config={{ score: { label: 'Score', color: T.yellow } }} className="h-full w-full">
                      <AreaChart data={trendData} margin={{ left: -20, right: 0, top: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={T.yellow} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={T.yellow} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: T.muted }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: T.muted }} axisLine={false} tickLine={false} domain={[60, 100]} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="score" stroke={T.yellow} strokeWidth={2} fill="url(#compGrad)" />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </div>
              </div>

              {/* Inspections Bar Chart */}
              <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] p-6">
                <SectionHeader title="Inspections by Type" badge={totalInsp} />
                <div className="h-[200px]">
                  {loading ? <Skel h={200} /> : inspChartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[14px] text-[#707a8a]">No data</div>
                  ) : (
                    <ChartContainer config={{ count: { label: 'Inspections', color: T.yellow } }} className="h-full w-full">
                      <BarChart data={inspChartData} margin={{ left: -20, right: 0, top: 4, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: T.muted }} axisLine={false} tickLine={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill={T.yellow} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Mine Table */}
            <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] overflow-hidden">
              <div className="px-6 py-5 border-b border-[#2b3139]">
                <SectionHeader title="Mine Compliance Monitor" badge={`${mines.length} tracking`} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2b3139] bg-[#181a20]/50">
                      {['Mine', 'Type', 'Location', 'Status', 'Violations', ''].map(h => (
                        <th key={h} className="px-6 py-3 text-[12px] font-semibold text-[#707a8a] uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2b3139]">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={6} className="px-6 py-4"><Skel h={20} /></td>
                        </tr>
                      ))
                    ) : mines.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[14px] text-[#707a8a]">
                          No active mines found
                        </td>
                      </tr>
                    ) : (
                      mines.slice(0, 8).map(m => {
                        const vCount = violations.filter(v => v.mine_id === m.id).length
                        const vColor = vCount > 5 ? T.down : vCount > 2 ? '#f97316' : T.up
                        const isActive = m.status === 'active'
                        return (
                          <tr key={m.id} className="hover:bg-[#2b3139]/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#2b3139] flex items-center justify-center text-[13px] font-bold text-[#fcd535] shrink-0">
                                  {m.name?.charAt(0) ?? '?'}
                                </div>
                                <span className="text-[14px] font-semibold text-white">{m.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[13px] text-[#707a8a] capitalize">
                              {(m.mine_type ?? '—').replace(/_/g, ' ')}
                            </td>
                            <td className="px-6 py-4 text-[13px] text-[#707a8a]">
                              {[m.district, m.state].filter(Boolean).join(', ') || '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-md border ${isActive ? 'text-[#0ecb81] bg-[#0ecb81]/10 border-[#0ecb81]/20' : 'text-[#707a8a] bg-[#2b3139] border-[#2b3139]'}`}>
                                {m.status ?? 'active'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[15px] font-bold tabular-nums" style={{ color: vColor }}>
                                {vCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-[#fcd535] text-[13px] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                                Review <ChevronRight size={14} />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>

          {/* SIDE RAIL (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Actions */}
            <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] p-6">
              <SectionHeader title="Quick Actions" />
              <div className="flex flex-col gap-3">
                <Link to="/mine-map">
                  <button className="w-full flex items-center justify-between bg-[#2b3139] border border-[#2b3139] hover:border-[#fcd535] text-[#eaecef] px-4 py-3 rounded-lg transition-colors group">
                    <span className="text-[14px] font-semibold group-hover:text-[#fcd535]">View Full Risk Map</span>
                    <MapIcon size={16} className="text-[#707a8a] group-hover:text-[#fcd535]" />
                  </button>
                </Link>
                <Link to="/inspection">
                  <button className="w-full flex items-center justify-between bg-[#2b3139] border border-[#2b3139] hover:border-white text-[#eaecef] px-4 py-3 rounded-lg transition-colors group">
                    <span className="text-[14px] font-semibold group-hover:text-white">Inspections Tracker</span>
                    <Activity size={16} className="text-[#707a8a] group-hover:text-white" />
                  </button>
                </Link>
                <button className="w-full flex items-center justify-between bg-[#2b3139] border border-[#2b3139] hover:border-white text-[#eaecef] px-4 py-3 rounded-lg transition-colors group">
                  <span className="text-[14px] font-semibold group-hover:text-white">Generate Authority Report</span>
                  <FileText size={16} className="text-[#707a8a] group-hover:text-white" />
                </button>
                <button className="w-full flex items-center justify-between bg-[#f6465d]/10 border border-[#f6465d]/20 hover:border-[#f6465d] text-[#eaecef] px-4 py-3 rounded-lg transition-colors group mt-2">
                  <span className="text-[14px] font-semibold text-[#f6465d]">Emergency Shutdown</span>
                  <AlertTriangle size={16} className="text-[#f6465d]" />
                </button>
              </div>
            </div>

            {/* Violation Severity Breakdown */}
            <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] p-6">
              <SectionHeader title="Violation Severity" badge={violations.length} />
              {loading ? (
                <div className="flex flex-col gap-4 mt-4">
                  {[1,2,3].map(i => <Skel key={i} h={40} />)}
                </div>
              ) : violChartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[160px] gap-3 text-[#707a8a]">
                  <Target size={32} className="text-[#0ecb81] opacity-50" />
                  <span className="text-[14px] font-medium">No open violations</span>
                </div>
              ) : (
                <div className="flex flex-col gap-5 mt-4">
                  {violChartData.map(({ name, value }) => {
                    const max = Math.max(...violChartData.map(d => d.value))
                    const color = sevColor(name)
                    return (
                      <div key={name}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[13px] text-[#707a8a] font-medium capitalize">{name}</span>
                          <span className="text-[14px] font-bold" style={{ color }}>{value}</span>
                        </div>
                        <div className="h-2 w-full bg-[#2b3139] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-700 ease-out" 
                            style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} 
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent Violations Mini-List */}
            <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] p-6 flex-1">
              <SectionHeader title="Recent Alerts" />
              <div className="flex flex-col gap-4">
                {loading ? (
                  [1,2,3,4].map(i => <Skel key={i} h={60} />)
                ) : violations.length === 0 ? (
                  <div className="text-[14px] text-[#707a8a] text-center mt-10">No recent alerts</div>
                ) : (
                  violations.slice(0, 5).map(v => (
                    <div key={v.id} className="flex gap-3 items-start group">
                      <div className="mt-0.5">
                        <CircleAlert size={16} color={sevColor(v.severity)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#eaecef] leading-snug truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                          {v.description ?? v.title ?? 'Untitled Alert'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[12px] text-[#707a8a] capitalize">
                            {v.category ?? 'General'}
                          </span>
                          <span className="text-[10px] text-[#4b5563]">•</span>
                          <span className="text-[12px] text-[#707a8a]">
                            {v.created_at ? new Date(v.created_at).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
