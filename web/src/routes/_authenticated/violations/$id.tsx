import { createFileRoute, Link } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, ChevronLeft, Clock, FileText, UploadCloud, Users, ArrowUp } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/violations/$id')({
  component: ViolationDetailPage,
})

function ViolationDetailPage() {
  const { id } = Route.useParams()

  return (
    <>
      <Header fixed />
      
      <Main className='flex flex-1 flex-col p-4 md:p-8 bg-slate-50/50 max-w-[1000px] mx-auto w-full space-y-6'>
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {id}
              </span>
              <Badge variant="destructive">Non-Compliant</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">PM10 Limit Exceeded - Pit 2</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Violation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  Continuous Ambient Air Quality Monitoring Station (CAAQMS) recorded PM10 levels at 165µg/m³ for a 24-hour period, exceeding the statutory limit of 100µg/m³.
                </p>
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex gap-3 text-red-800 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <strong>Action Required:</strong> Immediate implementation of corrective dust suppression measures and submission of Corrective and Preventive Action (CAPA) report.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Submit CAPA Report
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 flex items-center gap-2"><Users className="h-4 w-4" /> Assign to (Safety Officer / Contractor)</label>
                    <select className="w-full h-10 px-3 border rounded-md text-sm bg-white mb-4">
                      <option>Select assignee...</option>
                      <option>Rajesh K. (Safety Officer, Pit 2)</option>
                      <option>Balaji Mining (Contractor)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Root Cause Analysis</label>
                    <textarea className="w-full h-24 p-3 border rounded-md text-sm bg-white" placeholder="Describe the root cause..."></textarea>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Corrective Actions Taken</label>
                    <textarea className="w-full h-24 p-3 border rounded-md text-sm bg-white" placeholder="Describe immediate actions taken..."></textarea>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Supporting Evidence</label>
                    <div className="w-full h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer">
                      <UploadCloud className="h-6 w-6 text-slate-400 mb-1" />
                      <div className="text-xs font-semibold text-slate-600">Upload photos/documents</div>
                    </div>
                  </div>
                  <Button className="w-full">Submit CAPA for Review</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Resolution Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-red-500 bg-white"></div>
                    <div className="text-sm font-semibold">Violation Logged</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Sep 04, 2026 • 14:30</div>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-white"></div>
                    <div className="text-sm font-semibold text-primary">CAPA Submission Pending</div>
                    <div className="text-xs font-bold text-red-500 mt-0.5">Due in 2 days</div>
                  </div>
                  <div className="relative pl-6 opacity-40">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-slate-300 bg-slate-100"></div>
                    <div className="text-sm font-semibold">Regulatory Review</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Pending submission</div>
                  </div>
                  <div className="relative pl-6 opacity-40">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-slate-300 bg-slate-100"></div>
                    <div className="text-sm font-semibold">Violation Closed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm mt-6">
              <CardHeader className="pb-3 border-b bg-red-50/50">
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <ArrowUp className="h-4 w-4" /> Escalation Ladder
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">L1</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Mine Manager</div>
                      <div className="text-xs text-muted-foreground">Notified immediately</div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 text-xs">L2</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Corporate HQ</div>
                      <div className="text-xs text-red-500 font-medium">Triggers in 48 hours</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">L3</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">DGMS / Regulatory</div>
                      <div className="text-xs text-muted-foreground">Triggers in 7 days</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  )
}
