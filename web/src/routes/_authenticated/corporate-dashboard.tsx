import { createFileRoute } from '@tanstack/react-router'
import { ArrowRight, ArrowDownRight, ArrowUpRight, MoreHorizontal, Truck, AlertTriangle, FileText, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_authenticated/corporate-dashboard')({
  component: CorporateDashboard,
})

function CorporateDashboard() {
  return (
    <div className="flex-grow flex flex-col items-center py-8 gap-8 w-full max-w-[1440px] mx-auto px-4 md:px-12">
      {/* Hero Section */}
      <section className="w-full flex flex-col items-start gap-6 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">Coal Operations Control</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <Card className="flex flex-col gap-2 shadow-none">
            <CardContent className="pt-6">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Total Yield (YTD)</span>
              <div className="text-4xl font-bold text-primary mt-2">429.4M Tons</div>
            </CardContent>
          </Card>
          <Card className="flex flex-col gap-2 shadow-none">
            <CardContent className="pt-6">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Active Workforce</span>
              <div className="text-4xl font-bold text-primary mt-2">12,450 Workers</div>
            </CardContent>
          </Card>
          <Card className="flex flex-col gap-2 shadow-none">
            <CardContent className="pt-6">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Safety Index</span>
              <div className="text-4xl font-bold text-emerald-500 mt-2">98.4% Safety</div>
            </CardContent>
          </Card>
        </div>
        <Button className="rounded-full px-6 py-6 text-base shadow-none">
          Initiate Site Audit
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Grid Layout */}
      <section className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Left 8 cols */}
        <Card className="md:col-span-8 flex flex-col shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <CardTitle className="text-lg font-semibold">Operational Efficiency</CardTitle>
            <MoreHorizontal className="text-muted-foreground h-5 w-5 cursor-pointer" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64 w-full bg-muted/30 rounded border relative overflow-hidden flex items-end">
              {/* Fake Chart */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
              <svg className="w-full h-full text-primary drop-shadow-sm" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path d="M0 40 L0 30 L10 32 L20 25 L30 28 L40 15 L50 20 L60 10 L70 18 L80 5 L90 12 L100 2 L100 40 Z" fill="currentColor" fillOpacity="0.2"></path>
                <path d="M0 30 L10 32 L20 25 L30 28 L40 15 L50 20 L60 10 L70 18 L80 5 L90 12 L100 2" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Right 4 cols */}
        <Card className="md:col-span-4 flex flex-col shadow-none">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col gap-3">
            <Button variant="outline" className="w-full justify-between h-14 text-base font-medium">
              Deploy Resources
              <Truck className="text-muted-foreground h-5 w-5" />
            </Button>
            <Button variant="outline" className="w-full justify-between h-14 text-base font-medium border-red-500/20 hover:bg-red-500/10 hover:text-red-500 transition-colors group">
              <span className="group-hover:text-red-500">Halt Operations</span>
              <AlertTriangle className="text-red-500 h-5 w-5" />
            </Button>
            <Button variant="outline" className="w-full justify-between h-14 text-base font-medium">
              Generate Report
              <FileText className="text-muted-foreground h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Bottom Table */}
      <Card className="w-full flex flex-col shadow-none">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-lg font-semibold">Compliance Risk Monitor</CardTitle>
        </CardHeader>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold text-xs uppercase tracking-wider">Site Name</TableHead>
                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Risk Score</TableHead>
                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">24h Change</TableHead>
                <TableHead className="text-center font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-base">
              <TableRow className="group">
                <TableCell className="font-medium">Alpha Pit</TableCell>
                <TableCell className="text-right font-mono">12.4</TableCell>
                <TableCell className="text-right text-emerald-500 font-mono">
                  <div className="flex items-center justify-end gap-1">
                    <ArrowDownRight className="h-4 w-4" /> -2.1
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Healthy</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" className="text-primary px-0 opacity-0 group-hover:opacity-100 transition-opacity">Review</Button>
                </TableCell>
              </TableRow>
              <TableRow className="group">
                <TableCell className="font-medium">Beta Shaft</TableCell>
                <TableCell className="text-right font-mono">87.2</TableCell>
                <TableCell className="text-right text-red-500 font-mono">
                  <div className="flex items-center justify-end gap-1">
                    <ArrowUpRight className="h-4 w-4" /> +14.5
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Critical</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" className="text-primary px-0 opacity-0 group-hover:opacity-100 transition-opacity">Review</Button>
                </TableCell>
              </TableRow>
              <TableRow className="group">
                <TableCell className="font-medium">Gamma Terminal</TableCell>
                <TableCell className="text-right font-mono">45.0</TableCell>
                <TableCell className="text-right text-muted-foreground font-mono">
                  <div className="flex items-center justify-end gap-1">
                    <Minus className="h-4 w-4" /> 0.0
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Monitor</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" className="text-primary px-0 opacity-0 group-hover:opacity-100 transition-opacity">Review</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
