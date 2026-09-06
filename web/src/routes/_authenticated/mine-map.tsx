import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import Map from 'react-map-gl/maplibre'
import DeckGL from '@deck.gl/react'
import { ScatterplotLayer } from '@deck.gl/layers'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Activity, X, ChevronRight, Wind, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_authenticated/mine-map')({
  component: MineMap,
})

const INITIAL_VIEW_STATE = {
  longitude: 82.5,
  latitude: 22.5,
  zoom: 5,
  pitch: 45,
  bearing: 0,
}

const MINE_DATA = [
  { id: '1', name: 'Alpha Pit', coordinates: [82.3, 22.4], risk: 12.4, status: 'healthy', activeAlerts: 0 },
  { id: '2', name: 'Beta Shaft', coordinates: [83.1, 23.2], risk: 87.2, status: 'critical', activeAlerts: 3 },
  { id: '3', name: 'Gamma Terminal', coordinates: [81.5, 21.8], risk: 45.0, status: 'monitor', activeAlerts: 1 },
]

function MineMap() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)
  const [selectedMine, setSelectedMine] = useState<any>(null)

  const layers = [
    new ScatterplotLayer({
      id: 'mines-layer',
      data: MINE_DATA,
      getPosition: d => d.coordinates,
      getFillColor: d => {
        if (d.status === 'critical') return [239, 68, 68, 200]
        if (d.status === 'healthy') return [16, 185, 129, 200]
        return [252, 211, 77, 200]
      },
      getRadius: d => (d.risk / 100) * 8000 + 2000, // Dynamic radius based on risk
      radiusScale: 1,
      radiusMinPixels: 8,
      radiusMaxPixels: 30,
      pickable: true,
      autoHighlight: true,
      onClick: ({object}) => {
        if (object) {
          setSelectedMine(object)
          setViewState(v => ({
            ...v,
            longitude: object.coordinates[0],
            latitude: object.coordinates[1],
            zoom: 9,
            transitionDuration: 1000
          }))
        }
      }
    })
  ]

  return (
    <div className="flex-grow flex h-[calc(100vh-4rem)] w-full overflow-hidden relative">
      <aside className="w-80 border-r bg-card flex flex-col z-10 shrink-0 shadow-lg">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg mb-4">Site Explorer</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search sites..." className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {MINE_DATA.map((site, idx) => (
            <Card 
              key={idx} 
              className={`cursor-pointer transition-colors ${selectedMine?.id === site.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
              onClick={() => {
                setSelectedMine(site)
                setViewState(v => ({
                  ...v,
                  longitude: site.coordinates[0],
                  latitude: site.coordinates[1],
                  zoom: 9,
                  transitionDuration: 1000
                }))
              }}
            >
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <div className="font-semibold text-sm">{site.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {site.coordinates[0].toFixed(2)}, {site.coordinates[1].toFixed(2)}
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded ${
                  site.status === 'critical' ? 'bg-red-500/10 text-red-500' :
                  site.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-500' :
                  'bg-amber-500/10 text-amber-600'
                }`}>
                  Risk {site.risk.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </aside>

      <main className="flex-1 relative bg-background">
        <DeckGL
          initialViewState={viewState}
          controller={true}
          layers={layers}
          onViewStateChange={({ viewState }) => setViewState(viewState)}
          getTooltip={({object}) => object && `${object.name}\nRisk Score: ${object.risk}`}
        >
          <Map
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            attributionControl={false}
          />
        </DeckGL>

        {/* Slide-in details card */}
        <div className={`absolute top-4 right-4 w-96 bg-card border shadow-2xl rounded-xl transition-all duration-300 transform ${selectedMine ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
          {selectedMine && (
            <div className="flex flex-col max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-card z-10 rounded-t-xl">
                <h3 className="font-bold text-lg">{selectedMine.name}</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedMine(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1 bg-muted/50 p-3 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Risk Score</div>
                    <div className={`text-2xl font-black ${selectedMine.status === 'critical' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {selectedMine.risk}
                    </div>
                  </div>
                  <div className="flex-1 bg-muted/50 p-3 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Active Alerts</div>
                    <div className={`text-2xl font-black ${selectedMine.activeAlerts > 0 ? 'text-red-500' : 'text-slate-700'}`}>
                      {selectedMine.activeAlerts}
                    </div>
                  </div>
                </div>

                {selectedMine.status === 'critical' && (
                  <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex gap-3">
                    <Activity className="h-5 w-5 text-red-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-800">Critical Alerts Detected</h4>
                      <p className="text-xs text-red-600 mt-1">PM10 levels exceeding limits and pending DGMS notices.</p>
                      <Button size="sm" variant="outline" className="h-7 text-xs mt-2 text-red-700 border-red-200">View Alerts</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm border-b pb-2">Quick Actions</h4>
                  <Link to="/environment" className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md group">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <Wind className="h-4 w-4 text-blue-500" /> View Environment Dashboard
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                  <Link to="/compliance" className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-md group">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <Droplets className="h-4 w-4 text-emerald-500" /> Check EC Conditions
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

