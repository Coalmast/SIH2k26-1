import { useTranslation } from "react-i18next";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Download, Lock, CheckCircle2, FileText, Loader2, AlertTriangle, Scale, ListChecks, Info, Eye, Terminal } from 'lucide-react';
import { useComplianceInstance, useApproveInstance } from '../hooks/useCompliance';
import { SubmitEvidenceForm } from '../forms/SubmitEvidenceForm';
import { motion } from 'framer-motion';
import { MagicCard } from '@/components/ui/magic-card';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex h-full flex-col gap-6 p-6 overflow-y-auto relative"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-64 w-96 rounded-full bg-primary/10 blur-[100px] -z-10" />
      <div className="pointer-events-none absolute top-20 right-1/4 h-64 w-96 rounded-full bg-indigo-500/10 blur-[100px] -z-10" />

      {/* Header section */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {instance.requirement?.title || 'Compliance Task'}
            </h1>
            <div className="relative flex items-center justify-center">
              {instance.status === 'pending' && <div className="absolute inset-0 bg-yellow-500/30 blur-md rounded-full"></div>}
              {instance.status === 'breached' && <div className="absolute inset-0 bg-red-500/30 blur-md rounded-full animate-pulse"></div>}
              <Badge className={`relative px-3 py-1 shadow-sm ${
                instance.status === 'pending' ? "bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25 border-yellow-500/30" :
                instance.status === 'approved' ? "bg-green-500/15 text-green-500 hover:bg-green-500/25 border-green-500/30" :
                instance.status === 'breached' ? "bg-red-500/15 text-red-500 hover:bg-red-500/25 border-red-500/30" :
                "bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border-blue-500/30"
              }`}>{instance.status?.toUpperCase()}</Badge>
            </div>
          </div>
          <div className="flex gap-4 text-sm font-medium">
            <span className={instance.status === 'breached' ? "text-red-500" : "text-amber-500/90"}>
              {t("due", "Due:")} {new Date(instance.due_date).toLocaleDateString()}
            </span>
          </div>
        </div>
        {instance.status === 'in_progress' && (
          <div className="flex gap-2">
            <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10 backdrop-blur-sm">{t("reject", "Reject")}</Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20">
              {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {t("approve_complete", "Approve & Complete")}
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Context and details */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          <motion.div variants={itemVariants}>
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-primary" /> What is it about?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {instance.requirement?.description || 
                    "This compliance task requires standard verification of mine site operations to ensure adherence to safety and environmental guidelines."}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="h-full">
              <Card className="h-full border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ListChecks className="h-5 w-5 text-emerald-500" /> What it includes?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-foreground/80 space-y-2 list-disc list-inside">
                    <li>Form 10A Submission</li>
                    <li>Monthly Environmental clear-out metrics</li>
                    <li>Photographic evidence of Site #3 safety barriers</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="h-full">
              <MagicCard mode="orb" glowOpacity={0.4} className="h-full flex flex-col gap-6 py-6 rounded-xl border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Scale className="h-5 w-5 text-indigo-400" /> Rules & Regulations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm relative z-50">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground">
                        {instance.requirement?.regulation?.code || "EPA-1986, Sec 3"}
                      </span>
                      <span className="text-muted-foreground">
                        Governing Body: {instance.requirement?.regulation?.authority || "Ministry of Environment, Forest and Climate Change"}
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 backdrop-blur-md shadow-inner">
                      Mandatory Regulatory Requirement
                    </Badge>
                  </div>
                </CardContent>
              </MagicCard>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-blue-400" /> Observations Data Collected
                </CardTitle>
                <CardDescription>Field sensor readings and manual observer notes attached to this instance.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border/40 overflow-hidden bg-background/50">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-semibold">Metric / Observation</th>
                        <th className="px-4 py-2.5 text-left font-semibold">Value recorded</th>
                        <th className="px-4 py-2.5 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      <tr className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 font-medium">PM10 Dust Concentration</td>
                        <td className="px-4 py-3 text-foreground/80">85 µg/m³</td>
                        <td className="px-4 py-3"><Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none border-0">Normal</Badge></td>
                      </tr>
                      <tr className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 font-medium">Safety Inspector Notes</td>
                        <td className="px-4 py-3 text-foreground/80 max-w-[200px] truncate" title="Barriers near sector 4 are slightly damaged. Requires CAPA.">Barriers near sector 4 are slightly damaged.</td>
                        <td className="px-4 py-3"><Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-none border-0">Warning</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <MagicCard mode="orb" glowOpacity={0.5} className="flex flex-col gap-6 py-6 rounded-xl border-red-500/30 bg-card/40 backdrop-blur-md shadow-sm">
              <CardHeader className="pb-3 relative z-50">
                <CardTitle className="flex items-center gap-2 text-lg text-red-500">
                  <AlertTriangle className="h-5 w-5" /> Violations & CAPAs
                </CardTitle>
                <CardDescription>Associated infractions and Corrective/Preventive Actions.</CardDescription>
              </CardHeader>
              <CardContent className="relative z-50">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 shadow-inner">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-red-500">VIO-2026-089: Damaged Safety Barriers</h4>
                        <p className="text-xs text-muted-foreground mt-1">Logged on: {new Date(Date.now() - 86400000).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="destructive" className="animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]">Open Violation</Badge>
                    </div>
                    <p className="text-sm text-foreground/80 mb-4">
                      Inspector found damaged barriers in Sector 4 which poses a fall risk.
                    </p>
                    <div className="bg-background/80 rounded-lg p-3 border border-border/40 shadow-sm backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-semibold text-sm">CAPA Plan:</span>
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">In Progress</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Replace 50 meters of barrier fencing. Contractor notified. Expected completion in 3 days.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </MagicCard>
          </motion.div>

          {/* Existing Evidence Verification Component */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
              <CardHeader>
                <CardTitle>{t("evidence_verification", "Evidence Verification")}</CardTitle>
              </CardHeader>
              <CardContent>
                {instance.status === 'pending' ? (
                   <SubmitEvidenceForm instanceId={instanceId} />
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-border/40 p-4 bg-background/50 shadow-inner">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-primary/15 rounded-lg ring-1 ring-primary/20">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{t("evidence_uploaded", "Evidence Uploaded")}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t("document_processing_complete", "Document processing complete")}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 gap-1.5 py-1 px-3 shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />{t("verified", "VERIFIED")}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Right Column: Timelines and Audit */}
        <div className="flex flex-col gap-6">
          <motion.div variants={itemVariants}>
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
              <CardHeader>
                <CardTitle>{t("approval_timeline", "Approval Timeline")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border-l-2 border-border/60 ml-3 pl-6 pb-6">
                  <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1 ring-4 ring-green-500/20"></div>
                  <p className="text-sm font-semibold">{t("task_created", "Task Created")}</p>
                  <p className="text-xs text-muted-foreground mb-1">{new Date(instance.created_at).toLocaleString()}</p>
                </div>
                {instance.status !== 'pending' && (
                  <div className="relative border-l-2 border-border/60 ml-3 pl-6 pb-6">
                    <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1 ring-4 ring-green-500/20"></div>
                    <p className="text-sm font-semibold text-green-500">{t("evidence_submitted", "Evidence Submitted")}</p>
                    <p className="text-xs text-muted-foreground">{t("under_review_by_compliance_off", "Under Review by Compliance Officer")}</p>
                  </div>
                )}
                {instance.status === 'approved' ? (
                   <div className="relative ml-3 pl-6">
                   <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px] top-1 ring-4 ring-green-500/20 animate-pulse"></div>
                   <p className="text-sm font-semibold text-green-500">{t("approved_completed", "Approved & Completed")}</p>
                   <p className="text-xs text-muted-foreground">{new Date(instance.updated_at || new Date()).toLocaleString()}</p>
                 </div>
                ) : (
                  <div className="relative ml-3 pl-6">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1 ring-4 ring-primary/20 animate-pulse"></div>
                    <p className="text-sm font-semibold text-primary">{t("manager_approval", "Manager Approval")}</p>
                    <p className="text-xs text-primary/70">{t("pending", "Pending")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-sm">
              <CardHeader>
                <CardTitle>{t("audit_trail_security", "Audit Trail & Security")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  className={`w-full justify-start gap-3 border-border/50 h-auto py-3 ${instance.status !== 'PENDING' ? 'hover:bg-primary/5 hover:border-primary/30 transition-colors' : ''}`}
                  disabled={instance.status === 'PENDING'}
                >
                  <Terminal className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-semibold">{t("view_blockchain_hash", "View Blockchain Hash")}</span>
                    <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">0x4b7f...9a21</span>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 border-border/50 h-10 hover:bg-muted/50">
                  <Download className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t("export_audit_report_pdf", "Export Audit Report (PDF)")}</span>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
