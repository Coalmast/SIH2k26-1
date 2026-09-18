import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  HardHat, Plus, Search, Filter, AlertTriangle, 
  CheckCircle2, Bell, UploadCloud, ChevronDown, FileText, XCircle, Users
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ComposedChart, Line } from 'recharts'
import { ContractorTrustBadge } from '@/components/shared/ContractorTrustBadge'
import { NumberTicker } from '@/components/ui/number-ticker'
import { useDropzone } from 'react-dropzone'
import { Loader2 } from 'lucide-react'

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

const workersData = [
  { id: 'W-001', name: 'Ramesh Kumar', role: 'Excavator Operator', status: 'Active', shift: 'Morning' },
  { id: 'W-002', name: 'Suresh Singh', role: 'Blaster', status: 'Inactive', shift: 'Night' },
  { id: 'W-003', name: 'Amit Patel', role: 'Driver', status: 'Active', shift: 'Morning' },
  { id: 'W-004', name: 'Vikram Sharma', role: 'Supervisor', status: 'Active', shift: 'Evening' },
]

export function ContractorsModule() {
  const { t } = useTranslation();

  const [filter, setFilter] = useState('all')
  const [extractionState, setExtractionState] = useState<'idle'|'scanning'|'verified'>('idle')
  const [rfidScan, setRfidScan] = useState<{name: string, status: 'granted'|'denied'} | null>(null)

  const onDrop = () => {
    setExtractionState('scanning')
    setTimeout(() => setExtractionState('verified'), 3000)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.png'] }
  })

  // Simulation for RFID
  useEffect(() => {
    const interval = setInterval(() => {
       const isGranted = Math.random() > 0.3
       setRfidScan({
         name: isGranted ? 'Ramesh Kumar' : 'Suresh Singh',
         status: isGranted ? 'granted' : 'denied'
       })
       setTimeout(() => setRfidScan(null), 4000)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

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
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
            <Plus className="h-4 w-4 mr-2" />{t("onboard_vendor", "Onboard Vendor")}</Button>
        </div>
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

        {/* Live RFID Scan Target */}
        <Card className="shadow-sm border-border overflow-hidden relative">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Active Scan Target (RFID)
            </CardTitle>
            <CardDescription>Real-time gate access and personnel scanning</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[280px]">
            {rfidScan ? (
              <div className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 w-full max-w-sm animate-in zoom-in duration-300 ${
                rfidScan.status === 'granted' ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'
              }`}>
                {rfidScan.status === 'granted' ? (
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-2" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-500 mb-2" />
                )}
                <h3 className="text-2xl font-bold">{rfidScan.name}</h3>
                <p className="text-muted-foreground mb-4">Balaji Mining Services</p>
                <div className={`text-xl font-black tracking-widest ${
                  rfidScan.status === 'granted' ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {rfidScan.status === 'granted' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-muted-foreground opacity-50">
                <div className="h-24 w-24 border-4 border-dashed rounded-full border-muted-foreground animate-pulse mb-4 flex items-center justify-center">
                  <span className="font-mono text-xs">AWAITING SCAN</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
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
                {extractionState === 'verified' && (
                  <div className="flex flex-col gap-2 bg-emerald-950/30 p-3 rounded border border-emerald-900/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400"/>CLRA_Worker_005.pdf</span>
                      <Badge className="bg-emerald-500/20 text-emerald-300">Verified</Badge>
                    </div>
                    <div className="text-xs text-emerald-200/70 ml-6">
                      <p>Extracted: Name: Amit Patel, Valid Till: 2027-10</p>
                    </div>
                  </div>
                )}
                {extractionState === 'scanning' && (
                  <div className="flex items-center justify-between text-sm bg-muted p-3 rounded border border-border">
                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 text-amber-400 animate-spin"/>CLRA_Worker_005.pdf</span>
                    <span className="text-amber-400 text-xs animate-pulse">Scanning...</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm bg-muted p-2 rounded border border-border">
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-comet-up"/>{t("medical_roster_pdf", "Medical_Roster.pdf")}</span>
                  <Badge className="bg-comet-up/20 text-emerald-300">{t("verified", "Verified")}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Worker Management (New Section) */}
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Manage Mine Workers
              </CardTitle>
              <CardDescription>View roster, status, and shift assignments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Download Roster</Button>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Worker</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Shift</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {workersData.map((worker) => (
                    <tr key={worker.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{worker.id}</td>
                      <td className="px-4 py-3">{worker.name}</td>
                      <td className="px-4 py-3">{worker.role}</td>
                      <td className="px-4 py-3">{worker.shift}</td>
                      <td className="px-4 py-3">
                        <Badge variant={worker.status === 'Active' ? 'default' : 'secondary'} className={worker.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none' : ''}>
                          {worker.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
