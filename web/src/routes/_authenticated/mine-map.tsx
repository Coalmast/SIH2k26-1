import { useTranslation } from "react-i18next";
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo, useRef, useEffect } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Activity, X, ChevronRight, Wind, Droplets, ChevronDown, Copy, Crosshair, Layers, Focus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'

export const Route = createFileRoute('/_authenticated/mine-map')({
  component: MineMap,
})

const MAPTILER_KEY = 'XohI3EUdKAVWWP3q4tA3'

const INITIAL_VIEW_STATE = {
  longitude: 79.29,
  latitude: 19.95,
  zoom: 10,
  pitch: 45,
  bearing: 0,
}

const MINE_DATA = [
  {
    id: '1',
    name: 'Padmapur Open Cast Mine',
    subsidiary: 'WCL',
    coordinates: [79.3142, 20.0304],
    risk: 12.4,
    status: 'healthy',
    activeAlerts: 0
  },
  {
    id: '2',
    name: 'Hindustan Lalpeth Colliery',
    subsidiary: 'WCL',
    coordinates: [79.3126, 19.9244],
    risk: 87.2,
    status: 'critical',
    activeAlerts: 3
  },
  {
    id: '3',
    name: 'Durgapur Open Cast Mine',
    subsidiary: 'WCL',
    coordinates: [79.2989, 20.0081],
    risk: 45.0,
    status: 'monitor',
    activeAlerts: 1
  },
  {
    id: '4',
    name: 'Bhatadi Open Cast Mine',
    subsidiary: 'WCL',
    coordinates: [79.2674, 20.0574],
    risk: 32.1,
    status: 'healthy',
    activeAlerts: 0
  },
  {
    id: '5',
    name: 'Mana Incline',
    subsidiary: 'WCL',
    coordinates: [79.3115, 19.9085],
    risk: 65.5,
    status: 'monitor',
    activeAlerts: 2
  },
  {
    "id": "21",
    "name": "Neyveli Lignite Mine-I",
    "subsidiary": "NLC",
    "coordinates": [79.4826, 11.6042],
    "risk": 24.5,
    "status": "healthy",
    "activeAlerts": 0
  },
  {
    "id": "22",
    "name": "Singrauli Open Cast Mine",
    "subsidiary": "NCL",
    "coordinates": [82.7042, 24.1958],
    "risk": 41.2,
    "status": "monitor",
    "activeAlerts": 1
  },
  {
    "id": "23",
    "name": "Rajmahal Open Cast Project",
    "subsidiary": "ECL",
    "coordinates": [87.4682, 25.0214],
    "risk": 58.7,
    "status": "monitor",
    "activeAlerts": 2
  },
  {
    "id": "24",
    "name": "Korba Coalfield",
    "subsidiary": "SECL",
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

];


function MineMap() {
  const {
    t
  } = useTranslation();

  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
  const [selectedMine, setSelectedMine] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredMineId, setHoveredMineId] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const mapRef = useRef<any>(null);

  const filteredMines = MINE_DATA.filter(site => site.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const groupedMines = filteredMines.reduce((acc, mine) => {
    const sub = mine.subsidiary || 'Other';
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(mine);
    return acc;
  }, {} as Record<string, typeof MINE_DATA>);

  const toggleGroup = (sub: string) => {
    setCollapsedGroups(prev => ({ ...prev, [sub]: !prev[sub] }))
  }

  const handleCopyCoords = (e: React.MouseEvent, coords: number[]) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
  }

  const handleCenterMap = (e: React.MouseEvent, coords: number[]) => {
    e.stopPropagation();
    setViewState(v => ({
      ...v,
      longitude: coords[0],
      latitude: coords[1],
      zoom: 12,
      transitionDuration: 1000
    }))
  }

  return (
    <div className="flex-grow flex h-[calc(100vh-4rem)] w-full overflow-hidden relative">
      <aside className="w-80 border-r bg-card flex flex-col z-10 shrink-0 shadow-lg">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg mb-4">{t("site_explorer", "Site Explorer")}</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search sites..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
          {Object.entries(groupedMines).map(([subsidiary, mines]) => (
            <div key={subsidiary} className="space-y-3">
              <button 
                onClick={() => toggleGroup(subsidiary)}
                className="flex items-center gap-2 w-full text-left group hover:bg-muted/50 p-1.5 rounded-md transition-colors"
              >
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${collapsedGroups[subsidiary] ? '-rotate-90' : ''}`} />
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{subsidiary}</h3>
                <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold text-muted-foreground ml-auto">{mines.length}</span>
              </button>
              
              <AnimatePresence>
                {!collapsedGroups[subsidiary] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {mines.map((site, idx) => {
                      const isHovered = hoveredMineId === site.id;
                      const isSelected = selectedMine?.id === site.id;
                      
                      return (
                        <Card 
                          key={site.id} 
                          id={`mine-card-${site.id}`}
                          onMouseEnter={() => setHoveredMineId(site.id)}
                          onMouseLeave={() => setHoveredMineId(null)}
                          className={`cursor-pointer transition-all duration-180 ease-out border ${
                            isSelected ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 
                            isHovered ? 'border-primary/50 shadow-[0_6px_16px_-4px_rgba(0,0,0,0.08)] -translate-y-[2px]' : 
                            'border-border/50 bg-card/80 shadow-sm'
                          }`}
                          onClick={() => {
                            setSelectedMine(site)
                            setViewState(v => ({
                              ...v,
                              longitude: site.coordinates[0],
                              latitude: site.coordinates[1],
                              zoom: 11,
                              transitionDuration: 1000
                            }))
                          }}
                        >
                          <CardContent className="p-3.5 flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                              <div className="font-semibold text-sm leading-tight text-foreground/90">{site.name}</div>
                              <div className={`text-[10px] font-bold px-2 py-0.5 rounded ml-2 shrink-0 ${
                                site.status === 'critical' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                                site.status === 'healthy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                              }`}>RISK {site.risk.toFixed(1)}
                              </div>
                            </div>
                            <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 group/coords w-fit">
                              <MapPin className="h-3 w-3" />
                              <div className="bg-muted/50 px-1.5 py-0.5 rounded border border-border/50 tracking-wider">
                                {site.coordinates[0].toFixed(2)}° E, {site.coordinates[1].toFixed(2)}° N
                              </div>
                              <div className="opacity-0 group-hover/coords:opacity-100 flex items-center gap-1 transition-opacity">
                                <button onClick={(e) => handleCopyCoords(e, site.coordinates)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground" title="Copy Coordinates">
                                  <Copy className="h-3 w-3" />
                                </button>
                                <button onClick={(e) => handleCenterMap(e, site.coordinates)} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground" title="Center on Map">
                                  <Crosshair className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 relative bg-muted">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState as any)}
          mapStyle={`https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`}
          attributionControl={false}
          interactiveLayerIds={['mines-layer']}
        >
          {MINE_DATA.map(site => {
            const isHovered = hoveredMineId === site.id;
            const isSelected = selectedMine?.id === site.id;
            const size = isHovered || isSelected ? 24 : 16;
            
            return (
              <Marker 
                key={site.id} 
                longitude={site.coordinates[0]} 
                latitude={site.coordinates[1]}
                anchor="center"
              >
                <div 
                  className="relative group cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredMineId(site.id);
                    // Scroll into view
                    const el = document.getElementById(`mine-card-${site.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }}
                  onMouseLeave={() => setHoveredMineId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMine(site);
                  }}
                >
                  {/* Pulse effect on hover */}
                  {(isHovered || isSelected) && (
                    <span className={`absolute -inset-2 rounded-full animate-ping opacity-75 ${
                      site.status === 'critical' ? 'bg-rose-500' :
                      site.status === 'healthy' ? 'bg-emerald-500' :
                      'bg-amber-500'
                    }`} />
                  )}
                  {/* Main pin */}
                  <div 
                    className={`rounded-full border-2 border-white shadow-lg transition-transform duration-200 ${
                      isHovered ? 'scale-125' : 'scale-100'
                    }`}
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: site.status === 'critical' ? '#f43f5e' : site.status === 'healthy' ? '#10b981' : '#f59e0b',
                    }}
                  />
                  
                  {/* Custom Tooltip */}
                  {isHovered && !isSelected && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-xl p-3 z-50 pointer-events-none">
                      <div className="text-xs font-bold text-muted-foreground uppercase mb-0.5">{site.subsidiary || 'N/A'}</div>
                      <div className="font-semibold text-sm leading-tight mb-2">{site.name}</div>
                      <div className="flex items-center justify-between">
                        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          site.status === 'critical' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                          site.status === 'healthy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>RISK {site.risk.toFixed(1)}</div>
                        <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                          {site.activeAlerts > 0 ? (
                            <><Activity className="h-3 w-3 text-rose-500" /> {site.activeAlerts} Alerts</>
                          ) : (
                            <><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Nominal</>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Marker>
            );
          })}
        </Map>

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
          <Button variant="secondary" size="icon" className="h-10 w-10 bg-background/90 backdrop-blur shadow-md hover:bg-background" onClick={() => {
            setViewState(INITIAL_VIEW_STATE);
          }} title="Reset View">
            <Focus className="h-4 w-4" />
          </Button>
          <div className="flex flex-col bg-background/90 backdrop-blur rounded-md shadow-md overflow-hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-b border-border/50 hover:bg-muted" onClick={() => {
              setViewState(v => ({ ...v, zoom: v.zoom + 1 }))
            }} title="Zoom In">
              <span className="text-lg font-medium">+</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none hover:bg-muted" onClick={() => {
              setViewState(v => ({ ...v, zoom: v.zoom - 1 }))
            }} title="Zoom Out">
              <span className="text-xl font-medium leading-none">-</span>
            </Button>
          </div>
          <Button variant="secondary" size="icon" className="h-10 w-10 bg-background/90 backdrop-blur shadow-md hover:bg-background" title="Layers">
            <Layers className="h-4 w-4" />
          </Button>
        </div>

        {/* Floating Legend */}
        <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md p-3 rounded-lg border border-border/50 shadow-lg z-10 text-xs">
          <div className="font-semibold mb-2">Risk Thresholds</div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> 0–30 Low
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> 31–70 Moderate
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> 71–100 High
          </div>
        </div>

        {/* Slide-in details card (Glassmorphic) */}
        <div className={`absolute top-4 right-4 w-96 bg-background/80 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl transition-all duration-400 ease-out transform ${selectedMine ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0 pointer-events-none'}`}>
          {selectedMine && (
            <div className="flex flex-col max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="p-4 border-b border-border/50 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-10 rounded-t-2xl">
                <h3 className="font-bold text-lg text-foreground/90">{selectedMine.name}</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full hover:bg-muted" onClick={() => setSelectedMine(null)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">{t("close", "Close")}</span>
                </Button>
              </div>
              <div className="p-5 space-y-6">
                
                {/* Risk & Alerts */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-card/60 border border-border/50 p-3 rounded-xl text-center shadow-sm">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1 tracking-wider">{t("risk_score", "Risk Score")}</div>
                    <div className={`text-2xl font-black flex items-center justify-center gap-2 ${selectedMine.status === 'critical' ? 'text-rose-500' : selectedMine.status === 'healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {selectedMine.risk}
                      <svg className="w-8 h-4 text-muted-foreground/30" viewBox="0 0 40 16">
                        <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points="2,12 10,8 18,10 26,4 34,6" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 bg-card/60 border border-border/50 p-3 rounded-xl text-center shadow-sm">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1 tracking-wider">{t("active_alerts", "Active Alerts")}</div>
                    <div className={`text-2xl font-black ${selectedMine.activeAlerts > 0 ? 'text-rose-500' : 'text-foreground/80'}`}>
                      {selectedMine.activeAlerts}
                    </div>
                  </div>
                </div>

                {/* Operational Metrics */}
                <div className="bg-card/40 border border-border/50 p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Last Inspection</span>
                    <span className="font-semibold text-foreground/80">14 Sep 2026 (4 days ago)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">EC Clearance Expiry</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Valid until Dec 2028</span>
                  </div>
                </div>

                {selectedMine.status === 'critical' && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl flex gap-3 shadow-sm">
                    <Activity className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">{t("critical_alerts_detected", "Critical Alerts Detected")}</h4>
                      <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1 leading-relaxed">{t(
                        "pm10_levels_exceeding_limits_a",
                        "PM10 levels exceeding limits and pending DGMS notices."
                      )}</p>
                      <Button size="sm" variant="outline" className="h-7 text-xs mt-3 text-rose-600 border-rose-500/30 hover:bg-rose-500/20">{t("view_alerts", "View Alerts")}</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm border-b border-border/50 pb-2">{t("quick_actions", "Quick Actions")}</h4>
                  <div className="space-y-2">
                    <Link to="/environment" className="group flex items-center justify-between p-3 bg-card/60 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500/30 border border-border/60 rounded-xl transition-all shadow-sm">
                      <div className="flex items-center gap-3 text-sm font-medium text-foreground/80 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        <Wind className="h-4 w-4 text-blue-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                        {t("view_environment_dashboard", "View Environment Dashboard")}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                    <Link to="/compliance" className="group flex items-center justify-between p-3 bg-card/60 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500/30 border border-border/60 rounded-xl transition-all shadow-sm">
                      <div className="flex items-center gap-3 text-sm font-medium text-foreground/80 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                        <Droplets className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                        {t("check_ec_conditions", "Check EC Conditions")}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

