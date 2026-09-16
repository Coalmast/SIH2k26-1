import { useTranslation } from "react-i18next";
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
  const {
    t
  } = useTranslation();

  const { id } = Route.useParams()

  return (
    <>
      <Header fixed />

      <Main className='flex flex-1 flex-col p-4 md:p-8 bg-muted/30 max-w-[1000px] mx-auto w-full space-y-6'>
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
              <Badge variant="destructive">{t("non_compliant", "Non-Compliant")}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">{t("pm10_limit_exceeded_pit_2", "PM10 Limit Exceeded - Pit 2")}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b bg-muted/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />{t("violation_details", "Violation Details")}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <p className="text-sm text-foreground/80 leading-relaxed">{t(
                  "continuous_ambient_air_quality",
                  "Continuous Ambient Air Quality Monitoring Station (CAAQMS) recorded PM10 levels at 165µg/m³ for a 24-hour period, exceeding the statutory limit of 100µg/m³."
                )}</p>
                <div className="bg-[#f6465d]/10 p-3 rounded-lg border border-red-100 flex gap-3 text-comet-down text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <strong>{t("action_required", "Action Required:")}</strong>{t(
                    "immediate_implementation_of_co",
                    "Immediate implementation of corrective dust suppression measures and submission of Corrective and Preventive Action (CAPA) report."
                  )}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b bg-muted/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />{t("submit_capa_report", "Submit CAPA Report")}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 flex items-center gap-2"><Users className="h-4 w-4" />{t(
                      "assign_to_safety_officer_contr",
                      "Assign to (Safety Officer / Contractor)"
                    )}</label>
                    <select className="w-full h-10 px-3 border rounded-md text-sm bg-background mb-4">
                      <option>{t("select_assignee", "Select assignee...")}</option>
                      <option>{t("rajesh_k_safety_officer_pit_2", "Rajesh K. (Safety Officer, Pit 2)")}</option>
                      <option>{t("balaji_mining_contractor", "Balaji Mining (Contractor)")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">{t("root_cause_analysis", "Root Cause Analysis")}</label>
                    <textarea className="w-full h-24 p-3 border rounded-md text-sm bg-background" placeholder="Describe the root cause..."></textarea>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">{t("corrective_actions_taken", "Corrective Actions Taken")}</label>
                    <textarea className="w-full h-24 p-3 border rounded-md text-sm bg-background" placeholder="Describe immediate actions taken..."></textarea>
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">{t("supporting_evidence", "Supporting Evidence")}</label>
                    <div className="w-full h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center bg-muted/50 hover:bg-muted cursor-pointer">
                      <UploadCloud className="h-6 w-6 text-muted-foreground/70 mb-1" />
                      <div className="text-xs font-semibold text-muted-foreground">{t("upload_photos_documents", "Upload photos/documents")}</div>
                    </div>
                  </div>
                  <Button className="w-full">{t("submit_capa_for_review", "Submit CAPA for Review")}</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b bg-muted/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />{t("resolution_timeline", "Resolution Timeline")}</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="relative border-l-2 border-border ml-3 space-y-6">
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-red-500 bg-background"></div>
                    <div className="text-sm font-semibold">{t("violation_logged", "Violation Logged")}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t("sep_04_2026_14_30", "Sep 04, 2026 • 14:30")}</div>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-background"></div>
                    <div className="text-sm font-semibold text-primary">{t("capa_submission_pending", "CAPA Submission Pending")}</div>
                    <div className="text-xs font-bold text-comet-down mt-0.5">{t("due_in_2_days", "Due in 2 days")}</div>
                  </div>
                  <div className="relative pl-6 opacity-40">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-border bg-muted"></div>
                    <div className="text-sm font-semibold">{t("regulatory_review", "Regulatory Review")}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t("pending_submission", "Pending submission")}</div>
                  </div>
                  <div className="relative pl-6 opacity-40">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-border bg-muted"></div>
                    <div className="text-sm font-semibold">{t("violation_closed", "Violation Closed")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm mt-6">
              <CardHeader className="pb-3 border-b bg-[#f6465d]/10/50">
                <CardTitle className="text-base flex items-center gap-2 text-comet-down">
                  <ArrowUp className="h-4 w-4" />{t("escalation_ladder", "Escalation Ladder")}</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs">{t("l1", "L1")}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{t("mine_manager", "Mine Manager")}</div>
                      <div className="text-xs text-muted-foreground">{t("notified_immediately", "Notified immediately")}</div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-comet-up" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#f6465d]/15 flex items-center justify-center font-bold text-comet-down text-xs">{t("l2", "L2")}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{t("corporate_hq", "Corporate HQ")}</div>
                      <div className="text-xs text-comet-down font-medium">{t("triggers_in_48_hours", "Triggers in 48 hours")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs">{t("l3", "L3")}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{t("dgms_regulatory", "DGMS / Regulatory")}</div>
                      <div className="text-xs text-muted-foreground">{t("triggers_in_7_days", "Triggers in 7 days")}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    </>
  );
}
