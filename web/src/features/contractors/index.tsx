import { useTranslation } from "react-i18next";
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  HardHat, Plus, Search, Filter, AlertTriangle, 
  CheckCircle2, Bell, UploadCloud, ChevronDown, FileText
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ComposedChart, Line } from 'recharts'
import { ContractorTrustBadge } from '@/components/shared/ContractorTrustBadge'
import { NumberTicker } from '@/components/ui/number-ticker'
import { useDropzone } from 'react-dropzone'

// Mock Data
const mockContractors = [
  { id: 'C-8921', name: 'Balaji Mining Services', type: 'Overburden Removal', workers: 145, trustScore: 88, status: 'active', docsExpiry: '2026-10-15' },
  { id: 'C-7734', name: 'TechDrill Corp', type: 'Drilling & Blasting', workers: 42, trustScore: 62, status: 'warning', docsExpiry: '2026-09-10' },
  { id: 'C-9102', name: 'Apex Haulage', type: 'Transportation', workers: 0, trustScore: 41, status: 'expired', docsExpiry: '2025-12-01' }
]

const attendanceData = [
  { name: 'Mon', scheduled: 400, actual: 380 },
  { name: 'Tue', scheduled: 400, actual: 395 },
  { name: 'Wed', scheduled: 400, actual: 350 },
  { name: 'Thu', scheduled: 400, actual: 400 },
  { name: 'Fri', scheduled: 400, actual: 390 },
  { name: 'Sat', scheduled: 300, actual: 295 },
  { name: 'Sun', scheduled: 150, actual: 148 },
]

const productionData = [
  { name: 'Shift A', target: 5000, actual: 4800 },
  { name: 'Shift B', target: 5000, actual: 5100 },
  { name: 'Shift C', target: 4500, actual: 4200 },
]

export function ContractorsModule() {
  const {
    t
  } = useTranslation();

  const [filter, setFilter] = useState('all')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.png'] }
  })

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/50 min-h-screen text-foreground w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-muted/80 to-muted/40 border border-border p-6 rounded-xl text-foreground shadow-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <HardHat className="h-8 w-8 text-comet-up" />{t("contractor_vendor_portal", "Contractor & Vendor Portal")}</h1>
          <p className="text-muted-foreground mt-1">{t(
            "manage_vendor_compliance_ai_tr",
            "Manage vendor compliance, AI trust scores, and real-time attendance."
          )}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-background border-border text-foreground hover:bg-muted">{t("mine_all_active", "Mine: All Active")}<ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <div className="relative">
            <Button variant="outline" size="icon" className="bg-background border-border text-foreground hover:bg-muted">
              <Bell className="h-5 w-5" />
            </Button>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-comet-down opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-comet-down"></span>
            </span>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
            <Plus className="h-4 w-4 mr-2" />{t("onboard_vendor", "Onboard Vendor")}</Button>
        </div>
      </div>

      {/* Expiry Radar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Workers Expiring Medicals", count: 42, color: "bg-blue-500", label: "Next 30 Days" },
          { title: "Expiring Machinery Fitness", count: 8, color: "bg-amber-500", label: "MRN Checks" },
          { title: "Overdue Training Renewals", count: 15, color: "bg-comet-down", label: "Action Req" },
          { title: "Pending Corrective Actions", count: 4, color: "bg-comet-up", label: "CAPAs" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition-shadow border-border bg-background">
            <CardContent className="p-5">
              <div className="text-sm font-semibold text-muted-foreground">{stat.title}</div>
              <div className="flex items-end justify-between mt-2">
                <div className="text-4xl font-black text-foreground">
                  <NumberTicker value={stat.count} />
                </div>
                <Badge variant="outline" className="text-xs">{stat.label}</Badge>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
                <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: `${(stat.count / 50) * 100}%` }}></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Utilization Chart */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{t("resource_utilization_rfid_atte", "Resource Utilization (RFID Attendance)")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                <Legend />
                <Bar dataKey="scheduled" fill="#94a3b8" name="Scheduled" radius={[4,4,0,0]} />
                <Bar dataKey="actual" fill="#0ea5e9" name="Actual Present" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Production vs Target Chart */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">{t("production_vs_target_daily_ton", "Production vs Target (Daily Tonnage)")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={productionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                <Legend />
                <Bar dataKey="actual" fill="#10b981" barSize={32} name="Actual (Tons)" radius={[0,4,4,0]} />
                <Line type="step" dataKey="target" stroke="#0f172a" strokeWidth={3} name="Target" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contractor List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-4 items-center bg-background p-3 rounded-lg shadow-sm border border-border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input placeholder="Search contractors..." className="pl-9 bg-muted/50 border-transparent focus-visible:ring-emerald-500" />
            </div>
            <Button variant="outline" className="border-border"><Filter className="h-4 w-4 mr-2" />{t("filter", "Filter")}</Button>
          </div>

          <div className="grid gap-4">
            {mockContractors.map((contractor) => (
              <Card key={contractor.id} className="hover:shadow-md transition-shadow border-border overflow-hidden">
                <CardContent className="p-0 flex items-center">
                  <div className={`w-2 h-full absolute left-0 ${contractor.status === 'active' ? 'bg-comet-up' : contractor.status === 'warning' ? 'bg-amber-500' : 'bg-comet-down'}`}></div>
                  <div className="p-5 flex flex-1 items-center gap-6 pl-6">
                    <ContractorTrustBadge score={contractor.trustScore} />
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-lg">{contractor.name}</h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="font-normal">{contractor.type}</Badge>
                        <span>{t("id", "ID:")}{contractor.id}</span>
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <div className="text-2xl font-black text-foreground/80">{contractor.workers}</div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("workers", "Workers")}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" className="border-[#0ecb81]/30 text-comet-up hover:bg-[#0ecb81]/10">{t("view_profile", "View Profile")}</Button>
                      <Button variant="ghost" size="sm" className="text-comet-down hover:bg-[#f6465d]/10">{t("suspend", "Suspend")}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Document Upload Zone */}
        <Card className="shadow-sm border-border h-fit bg-[#0a192f] text-foreground">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-comet-up" />{t("ai_document_extraction", "AI Document Extraction")}</CardTitle>
            <p className="text-xs text-muted-foreground/70">{t(
              "upload_clra_epf_or_medical_cer",
              "Upload CLRA, EPF, or medical certificates for auto-verification."
            )}</p>
          </CardHeader>
          <CardContent>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-emerald-400 bg-emerald-900/20' : 'border-slate-600 hover:bg-muted'
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground/70 mb-4" />
              <p className="font-medium">{t("drag_drop_files_here", "Drag & drop files here")}</p>
              <p className="text-xs text-muted-foreground mt-2">{t("supports_pdf_jpeg_png_max_10mb", "Supports PDF, JPEG, PNG (Max 10MB)")}</p>
            </div>
            
            <div className="mt-6">
              <h4 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">{t("recent_uploads", "Recent Uploads")}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm bg-muted p-2 rounded border border-border">
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-comet-up"/>{t("medical_roster_pdf", "Medical_Roster.pdf")}</span>
                  <Badge className="bg-comet-up/20 text-emerald-300">{t("verified", "Verified")}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm bg-muted p-2 rounded border border-border">
                  <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-400"/>{t("clra_renew_pdf", "CLRA_Renew.pdf")}</span>
                  <span className="text-amber-400 text-xs animate-pulse">{t("scanning", "Scanning...")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

