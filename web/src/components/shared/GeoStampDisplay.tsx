import { MapPin, AlertTriangle, Crosshair } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface GeoStampDisplayProps {
  latitude: number
  longitude: number
  accuracy?: number
  locationMismatch?: boolean
  className?: string
}

export function GeoStampDisplay({
  latitude,
  longitude,
  accuracy = 10,
  locationMismatch = false,
  className
}: GeoStampDisplayProps) {
  const isLowConfidence = accuracy > 50

  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 font-mono text-muted-foreground">
          <MapPin className="size-4 text-primary" />
          <span>
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        </div>
        
        {locationMismatch && (
          <Badge variant="destructive" className="h-5 rounded-sm px-1.5 text-[10px] uppercase tracking-wider">
            Mismatch
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Crosshair className="size-3" />
          <span>±{accuracy.toFixed(1)}m</span>
        </div>
        
        {isLowConfidence && (
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
            <AlertTriangle className="size-3" />
            <span>Low Confidence</span>
          </div>
        )}
      </div>
    </div>
  )
}
