import { ArrowUp, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Compliance Score */}
      <Link to="/compliance" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        <Card className="flex flex-col shadow-sm hover:border-primary/50 transition-colors h-full">
          <CardHeader className="pb-2 pt-5 px-5 flex flex-row justify-between items-start">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Compliance Score</CardTitle>
            <CheckCircle className="h-5 w-5 text-comet-up" />
          </CardHeader>
          <CardContent className="px-5 pb-5 flex-1 flex items-end justify-between">
            <div className="text-4xl font-bold text-foreground">84</div>
            <div className="text-xs font-semibold text-comet-up flex items-center gap-1">
              <ArrowUp className="h-3 w-3" /> 2 MoM
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Open Violations */}
      <Link to="/inspection" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        <Card className="flex flex-col shadow-sm hover:border-primary/50 transition-colors h-full">
          <CardHeader className="pb-2 pt-5 px-5 flex flex-row justify-between items-start">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Open Violations</CardTitle>
            <AlertTriangle className="h-5 w-5 text-comet-down" />
          </CardHeader>
          <CardContent className="px-5 pb-5 flex-1 flex items-end justify-between">
            <div className="text-4xl font-bold text-foreground">12</div>
            <Badge variant="outline" className="bg-[#f6465d]/10 dark:bg-red-950/30 text-comet-down dark:text-comet-down border-[#f6465d]/30 dark:border-red-900/50 rounded-sm font-semibold">
              3 Critical
            </Badge>
          </CardContent>
        </Card>
      </Link>

      {/* Contractor Score */}
      <Link to="/contractors" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        <Card className="flex flex-col shadow-sm hover:border-primary/50 transition-colors h-full">
          <CardHeader className="pb-2 pt-5 px-5 flex flex-row justify-between items-start">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Contractor Score</CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent className="px-5 pb-5 flex-1 flex items-end gap-1">
            <div className="text-4xl font-bold text-foreground">78</div>
            <div className="text-sm text-muted-foreground mb-1">/100</div>
          </CardContent>
        </Card>
      </Link>

      {/* Production */}
      <Link to="/production" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        <Card className="flex flex-col shadow-sm hover:border-primary/50 transition-colors h-full">
          <CardHeader className="pb-2 pt-5 px-5 flex flex-row justify-between items-start">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Production (MT)</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="px-5 pb-5 flex-1 flex flex-col justify-end">
            <div className="text-4xl font-bold text-foreground">45,200</div>
            <div className="w-full bg-secondary mt-3 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '94%' }}></div>
            </div>
            <span className="text-xs text-muted-foreground mt-2 text-right">vs 48,000 Target</span>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

