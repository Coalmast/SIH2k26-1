import { useTranslation } from "react-i18next";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Download, Lock, CheckCircle2, FileText, Loader2, AlertTriangle, Scale, ListChecks, Info, Eye } from 'lucide-react';
import { useComplianceInstance, useApproveInstance } from '../hooks/useCompliance';
import { SubmitEvidenceForm } from '../forms/SubmitEvidenceForm';

interface Props {
  mineId: string;
  instanceId: string;
}

export function ComplianceInstanceDetail({ mineId, instanceId }: Props) {
  const { t } = useTranslation();

  const { data: instance, isLoading } = useComplianceInstance(instanceId);
  const approveMutation = useApproveInstance();

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!instance) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">{t("instance_not_found", "Instance not found.")}</div>;
  }

  const handleApprove = () => {
    approveMutation.mutate(instanceId);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6 overflow-y-auto">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{instance.requirement?.title || 'Compliance Task'}</h1>
            <Badge className={
              instance.status === 'pending' ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20" :
              instance.status === 'approved' ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" :
              instance.status === 'breached' ? "bg-comet-down/10 text-comet-down hover:bg-comet-down/20 border-red-500/20" :
              "bg-blue-500/10 text-blue-500 border-blue-500/20"
            }>{instance.status?.toUpperCase()}</Badge>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className={instance.status === 'breached' ? "text-comet-down" : "text-yellow-500"}>
              {t("due", "Due:")} {new Date(instance.due_date).toLocaleDateString()}
            </span>
          </div>
        </div>
        {instance.status === 'in_progress' && (
          <div className="flex gap-2">
            <Button variant="outline" className="border-red-500/50 text-comet-down hover:bg-comet-down/10">{t("reject", "Reject")}</Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending} className="bg-[#FCD535] text-black hover:bg-[#FCD535]/90 gap-2">
              {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {t("approve_complete", "Approve & Complete")}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Context and details (New Sections) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-primary" /> What is it about?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {instance.requirement?.description || 
                  "This compliance task requires standard verification of mine site operations to ensure adherence to safety and environmental guidelines."}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListChecks className="h-5 w-5 text-emerald-500" /> What it includes?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Form 10A Submission</li>
                  <li>Monthly Environmental clear-out metrics</li>
                  <li>Photographic evidence of Site #3 safety barriers</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Scale className="h-5 w-5 text-indigo-400" /> Rules & Regulations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground">
                      {instance.requirement?.regulation?.code || "EPA-1986, Sec 3"}
                    </span>
                    <span className="text-muted-foreground">
                      Governing Body: {instance.requirement?.regulation?.authority || "Ministry of Environment, Forest and Climate Change"}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                    Mandatory Regulatory Requirement
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5 text-blue-400" /> Observations Data Collected
              </CardTitle>
              <CardDescription>Field sensor readings and manual observer notes attached to this instance.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Metric / Observation</th>
                      <th className="px-4 py-2 text-left font-medium">Value recorded</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr>
                      <td className="px-4 py-3">PM10 Dust Concentration</td>
                      <td className="px-4 py-3">85 µg/m³</td>
                      <td className="px-4 py-3"><Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Normal</Badge></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">Safety Inspector Notes</td>
                      <td className="px-4 py-3 max-w-[200px] truncate" title="Barriers near sector 4 are slightly damaged. Requires CAPA.">Barriers near sector 4 are slightly damaged. Requires CAPA.</td>
                      <td className="px-4 py-3"><Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Warning</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-comet-down">
                <AlertTriangle className="h-5 w-5" /> Violations & CAPAs
              </CardTitle>
              <CardDescription>Associated infractions and Corrective/Preventive Actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-comet-down">VIO-2026-089: Damaged Safety Barriers</h4>
                      <p className="text-xs text-muted-foreground mt-1">Logged on: {new Date(Date.now() - 86400000).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="destructive">Open Violation</Badge>
                  </div>
                  <p className="text-sm text-foreground/80 mb-3">
                    Inspector found damaged barriers in Sector 4 which poses a fall risk.
                  </p>
                  <div className="bg-background rounded p-3 border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">CAPA Plan:</span>
                      <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">In Progress</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Replace 50 meters of barrier fencing. Contractor notified. Expected completion in 3 days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Evidence Verification Component */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>{t("evidence_verification", "Evidence Verification")}</CardTitle>
            </CardHeader>
            <CardContent>
              {instance.status === 'pending' ? (
                 <SubmitEvidenceForm instanceId={instanceId} />
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-background">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{t("evidence_uploaded", "Evidence Uploaded")}</p>
                      <p className="text-xs text-muted-foreground">{t("document_processing_complete", "Document processing complete")}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                    <CheckCircle2 className="h-3 w-3" />{t("verified", "VERIFIED")}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Timelines and Audit */}
        <div className="flex flex-col gap-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>{t("approval_timeline", "Approval Timeline")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-border/50 ml-3 pl-6 pb-6">
                <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[6.5px] top-1"></div>
                <p className="text-sm font-medium">{t("task_created", "Task Created")}</p>
                <p className="text-xs text-muted-foreground mb-1">{new Date(instance.created_at).toLocaleString()}</p>
              </div>
              {instance.status !== 'pending' && (
                <div className="relative border-l border-border/50 ml-3 pl-6 pb-6">
                  <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[6.5px] top-1"></div>
                  <p className="text-sm font-medium text-green-500">{t("evidence_submitted", "Evidence Submitted")}</p>
                  <p className="text-xs text-muted-foreground">{t("under_review_by_compliance_off", "Under Review by Compliance Officer")}</p>
                </div>
              )}
              {instance.status === 'approved' ? (
                 <div className="relative ml-3 pl-6">
                 <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[6.5px] top-1"></div>
                 <p className="text-sm font-medium text-green-500">{t("approved_completed", "Approved & Completed")}</p>
                 <p className="text-xs text-muted-foreground">{new Date(instance.updated_at || new Date()).toLocaleString()}</p>
               </div>
              ) : (
                <div className="relative ml-3 pl-6">
                  <div className="absolute w-3 h-3 bg-muted rounded-full -left-[6.5px] top-1"></div>
                  <p className="text-sm font-medium text-muted-foreground">{t("manager_approval", "Manager Approval")}</p>
                  <p className="text-xs text-muted-foreground">{t("pending", "Pending")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>{t("audit_trail_security", "Audit Trail & Security")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button variant="outline" className="w-full justify-start gap-3 border-border/50" disabled={instance.status === 'PENDING'}>
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{t("view_blockchain_hash", "View Blockchain Hash")}</span>
                  <span className="text-xs text-muted-foreground font-mono">{t("0x4b7f_9a21", "0x4b7f...9a21")}</span>
                </div>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 border-border/50">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t("export_audit_report_pdf", "Export Audit Report (PDF)")}</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
