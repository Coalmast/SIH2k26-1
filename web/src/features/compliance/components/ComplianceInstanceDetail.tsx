import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Download, Lock, CheckCircle2, AlertTriangle, FileText, Send, MapPin, Loader2 } from 'lucide-react';
import { useComplianceInstance, useApproveInstance } from '../hooks/useCompliance';
import { SubmitEvidenceForm } from '../forms/SubmitEvidenceForm';

interface Props {
  mineId: string;
  instanceId: string;
}

export function ComplianceInstanceDetail({ mineId, instanceId }: Props) {
  const {
    t
  } = useTranslation();

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
    <div className="flex h-full flex-col gap-6 p-6">
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
            {instance.requirement?.regulation && <span>{t("regulation", "Regulation:")}{instance.requirement.regulation.code}</span>}
            {instance.requirement?.regulation && <span>{t("text", "•")}</span>}
            {instance.requirement?.regulation && <span>{t("authority", "Authority:")}{instance.requirement.regulation.authority}</span>}
            {instance.requirement?.regulation && <span>{t("text", "•")}</span>}
            <span className={instance.status === 'breached' ? "text-comet-down" : "text-yellow-500"}>{t("due", "Due:")}{new Date(instance.due_date).toLocaleDateString()}</span>
          </div>
        </div>
        {instance.status === 'in_progress' && (
          <div className="flex gap-2">
            <Button variant="outline" className="border-red-500/50 text-comet-down hover:bg-comet-down/10">{t("reject", "Reject")}</Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending} className="bg-[#FCD535] text-black hover:bg-[#FCD535]/90 gap-2">
              {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}{t("approve_complete", "Approve & Complete")}</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6 h-full">
        <div className="col-span-2 flex flex-col gap-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>{t("evidence_verification", "Evidence Verification")}</CardTitle>
            </CardHeader>
            <CardContent>
              {instance.status === 'pending' ? (
                 <SubmitEvidenceForm instanceId={instanceId} />
              ) : (
                <div className="mt-2 flex items-center justify-between rounded-lg border border-border/50 p-4 bg-background">
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

          {instance.status !== 'pending' && (
            <Card className="border-border/50 bg-card/50 flex-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>{t("ocr_review_side_by_side", "OCR Review (Side-by-Side)")}</CardTitle>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                  <CheckCircle2 className="h-3 w-3" />{t("confidence_92", "Confidence 92%")}</Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6 pt-4 h-full">
                <div className="rounded-lg bg-muted/30 border border-border/50 p-4 flex items-center justify-center min-h-[300px]">
                  <p className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 opacity-50" />{t("document_scan_view", "Document Scan View")}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("extracted_date", "Extracted Date")}</label>
                    <div className="p-2 text-sm rounded bg-background border border-border">{new Date().toLocaleDateString()}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">{t("mine_name", "Mine Name")}</label>
                    <div className="p-2 text-sm rounded bg-background border border-border text-foreground">{t("rajmahal_ocp", "Rajmahal OCP")}</div>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Button variant="outline" className="flex-1" disabled>{t("fields_verified", "Fields Verified")}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

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
