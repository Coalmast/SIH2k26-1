import React from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ChevronLeft, FileText, CheckCircle2, Clock, Activity, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function IncidentDetail() {
  const { id } = useParams({ from: '/_authenticated/incidents/$id' })

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/30 max-w-[1000px] mx-auto w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/incidents">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {id}
            </span>
            <Badge variant="secondary">Investigating</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Roof Fall in Development Heading</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><FileText className="h-4 w-4 mr-2" /> Generate Form 4-A</Button>
          <Button><CheckCircle2 className="h-4 w-4 mr-2" /> Mark Resolved</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Incident Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm text-foreground/80 leading-relaxed">
                During the second half of Shift A, a minor roof fall occurred at Pit 3 East in the new development heading. 
                Approximately 2 tons of loose rock dislodged from the upper left strata. 
                No personnel were in the immediate drop zone. Operations were immediately halted and the area barricaded.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Date & Time</div>
                  <div className="text-sm font-medium">Sep 02, 2026<br/>10:15 AM</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Location</div>
                  <div className="text-sm font-medium">Pit 3 East<br/>Section B</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Shift</div>
                  <div className="text-sm font-medium">Shift A<br/>06:00 - 14:00</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Reported By</div>
                  <div className="text-sm font-medium">Rahul Sharma<br/>Overman</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" /> Persons Involved
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="p-4 flex items-center justify-between hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-muted-foreground">VK</div>
                    <div>
                      <div className="font-semibold text-sm">Vikram Kumar</div>
                      <div className="text-xs text-muted-foreground">Drill Operator (ID: 1042)</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-[#0ecb81]/10 text-comet-up border-[#0ecb81]/30">Uninjured</Badge>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-muted-foreground">SD</div>
                    <div>
                      <div className="font-semibold text-sm">Suresh Das</div>
                      <div className="text-xs text-muted-foreground">Helper (ID: 2891)</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-[#0ecb81]/10 text-comet-up border-[#0ecb81]/30">Uninjured</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-orange-200">
            <CardHeader className="pb-3 border-b border-orange-100 bg-orange-50/50">
              <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                <Activity className="h-4 w-4" /> AI Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 bg-orange-50/20">
              <div className="mb-4">
                <div className="text-xs text-orange-600/70 font-bold uppercase mb-1">Suggested Severity</div>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 text-sm">HIGH</Badge>
              </div>
              <div>
                <div className="text-xs text-orange-600/70 font-bold uppercase mb-1">Category & Tags</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-background">Strata Control</Badge>
                  <Badge variant="secondary" className="bg-background">Near Miss</Badge>
                </div>
              </div>
              <p className="text-xs text-orange-800 mt-4 leading-relaxed">
                <strong>Insight:</strong> This is the 2nd roof fall incident in Pit 3 East this month. 
                Correlates with recent seismic activity alerts. Immediate geotechnical review recommended.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" /> DGMS Notification Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative border-l-2 border-border ml-3 space-y-6">
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-emerald-500 bg-background"></div>
                  <div className="text-sm font-semibold">Initial Alert (SMS/Email)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Sent at 10:18 AM</div>
                </div>
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-background"></div>
                  <div className="text-sm font-semibold">Form 4-A Submission</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Due within 24 hours</div>
                  <Button size="sm" variant="outline" className="h-7 text-xs mt-2">Generate Now</Button>
                </div>
                <div className="relative pl-6 opacity-50">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-border bg-muted"></div>
                  <div className="text-sm font-semibold">Form 4-B (Status Update)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Due within 7 days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
