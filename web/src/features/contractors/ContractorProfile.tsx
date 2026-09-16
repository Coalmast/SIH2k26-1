import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ContractorTrustBadge } from '@/components/shared/ContractorTrustBadge'
import { HardHat, FileText, CheckCircle2, AlertTriangle, XCircle, FilePlus, ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function ContractorProfile({ id }: { id: string }) {
  const {
    t
  } = useTranslation();

  // Mock data
  const contractor = {
    id,
    name: 'Balaji Mining Services',
    type: 'Overburden Removal',
    status: 'active',
    trustScore: 88,
    breakdown: { documents: 100, safety: 85, capa: 90, billing: 75 }
  }

  const docs = [
    { name: 'CLRA License', status: 'valid', expiry: '2026-10-15', file: 'clra_2025.pdf' },
    { name: 'ESI Registration', status: 'valid', expiry: '2027-01-01', file: 'esi_reg.pdf' },
    { name: 'Machinery Fitness (MRN)', status: 'expiring', expiry: '2025-08-10', file: 'mrn_fleet.pdf' },
    { name: 'Safety Certificate', status: 'expired', expiry: '2024-12-01', file: 'safety_cert_24.pdf' }
  ]

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/50 min-h-screen text-foreground w-full space-y-6">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background border p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-6">
          <ContractorTrustBadge score={contractor.trustScore} breakdown={contractor.breakdown} />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{contractor.name}</h1>
            <div className="flex gap-2 items-center mt-1">
              <Badge variant="outline">{contractor.type}</Badge>
              <span className="text-sm text-muted-foreground">{t("id", "ID:")}{contractor.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-comet-down border-[#f6465d]/30 hover:bg-[#f6465d]/10">{t("flag_as_high_risk", "Flag as High Risk")}</Button>
          <Link to="/contractors/$id/workers" params={{ id }}>
            <Button className="bg-background text-foreground hover:bg-muted">
              <HardHat className="h-4 w-4 mr-2" />{t("view_workers_registry", "View Workers Registry")}</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Document Status */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">{t("statutory_documents", "Statutory Documents")}</CardTitle>
            <Button variant="ghost" size="sm" className="text-comet-up"><FilePlus className="h-4 w-4 mr-1"/>{t("upload_renewed", "Upload Renewed")}</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {docs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  {doc.status === 'valid' && <CheckCircle2 className="h-5 w-5 text-comet-up" />}
                  {doc.status === 'expiring' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                  {doc.status === 'expired' && <XCircle className="h-5 w-5 text-comet-down" />}
                  <div>
                    <div className="font-medium text-sm text-foreground">{doc.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <FileText className="h-3 w-3" /> {doc.file}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={doc.status === 'expired' ? 'destructive' : 'outline'} className={doc.status === 'expiring' ? 'border-amber-200 text-amber-700 bg-amber-50' : ''}>{t("expires", "Expires:")}{doc.expiry}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Trust Score Breakdown */}
        <Card className="shadow-sm border-emerald-100 bg-[#0ecb81]/10/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">{t("ai_trust_breakdown", "AI Trust Breakdown")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{t("document_validity", "Document Validity")}</span>
                <span className="text-foreground">{contractor.breakdown.documents}{t("text", "%")}</span>
              </div>
              <Progress value={contractor.breakdown.documents} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{t("safety_incidents", "Safety & Incidents")}</span>
                <span className="text-foreground">{contractor.breakdown.safety}{t("text", "%")}</span>
              </div>
              <Progress value={contractor.breakdown.safety} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{t("capa_resolution_rate", "CAPA Resolution Rate")}</span>
                <span className="text-foreground">{contractor.breakdown.capa}{t("text", "%")}</span>
              </div>
              <Progress value={contractor.breakdown.capa} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{t("billing_accuracy", "Billing Accuracy")}</span>
                <span className="text-foreground">{contractor.breakdown.billing}{t("text", "%")}</span>
              </div>
              <Progress value={contractor.breakdown.billing} className="h-2" />
            </div>
            <Button variant="outline" className="w-full mt-4">{t("view_ai_explanation", "View AI Explanation")}<ChevronRight className="h-4 w-4 ml-1" /></Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
