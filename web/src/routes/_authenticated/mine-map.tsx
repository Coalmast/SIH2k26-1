import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Map from 'react-map-gl/maplibre'
import DeckGL from '@deck.gl/react'
import { ScatterplotLayer } from '@deck.gl/layers'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, MapPin } from 'lucide-react'

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

// Sample mock data for coal mines
const MINE_DATA = [
  { name: 'Alpha Pit', coordinates: [82.3, 22.4], risk: 12.4, status: 'healthy' },
  { name: 'Beta Shaft', coordinates: [83.1, 23.2], risk: 87.2, status: 'critical' },
  { name: 'Gamma Terminal', coordinates: [81.5, 21.8], risk: 45.0, status: 'monitor' },
]

function MineMap() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)

  const layers = [
    new ScatterplotLayer({
      id: 'mines-layer',
      data: MINE_DATA,
      getPosition: d => d.coordinates,
      getFillColor: d => {
        if (d.status === 'critical') return [239, 68, 68, 200] // Red
        if (d.status === 'healthy') return [16, 185, 129, 200] // Green
        return [252, 211, 77, 200] // Yellow
      },
      getRadius: d => d.risk * 500,
      radiusScale: 1,
      radiusMinPixels: 5,
      radiusMaxPixels: 20,
      pickable: true,
      autoHighlight: true,
    })
  ]

  return (
    <div className="flex-grow flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-card flex flex-col z-10 shrink-0">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg mb-4">Site Explorer</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search sites..." className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {MINE_DATA.map((site, idx) => (
            <Card key={idx} className="cursor-pointer hover:border-primary transition-colors">
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
                  'bg-primary/10 text-primary'
                }`}>
                  {site.risk.toFixed(1)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </aside>

      {/* Main Map */}
      <main className="flex-1 relative bg-background">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layers}
          onViewStateChange={({ viewState }) => setViewState(viewState)}
          getTooltip={({object}) => object && `${object.name}\nRisk: ${object.risk}`}
        >
          <Map
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            attributionControl={false}
          />
        </DeckGL>
      </main>
    </div>
  )
}
