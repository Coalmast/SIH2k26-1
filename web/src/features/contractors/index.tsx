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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { NumberTicker } from '@/components/ui/number-ticker'
import { useDropzone } from 'react-dropzone'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MagicCard } from '@/components/ui/magic-card'
import { useOCR } from './hooks/useOCR'
import { OcrResultPanel } from './components/OcrResultPanel'

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
  const { result: ocrResult, uploadAndOCR, reset: resetOCR } = useOCR()
  const [rfidScan, setRfidScan] = useState<{name: string, status: 'granted'|'denied'} | null>(null)

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadAndOCR(acceptedFiles[0]);
    }
  }

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.png', '.jpg'] },
    maxFiles: 1
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
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-card/80 to-card/40 border border-border p-6 rounded-xl text-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md"
      >
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
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Resource Utilization Chart */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
          <MagicCard className="shadow-lg border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">{t("resource_utilization_rfid_atte", "Resource Utilization (RFID Attendance)")}</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
                  <RechartsTooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                  <Legend />
                  <Bar dataKey="scheduled" fill="#64748b" name="Scheduled" radius={[4,4,0,0]} />
                  <Bar dataKey="actual" fill="#10b981" name="Actual Present" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </MagicCard>
        </motion.div>

        {/* Live RFID Scan Target */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
          <MagicCard className="shadow-lg border-border/50 overflow-hidden relative h-full">
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
                <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 w-full max-w-sm animate-in zoom-in duration-300 backdrop-blur-sm shadow-inner ${
                  rfidScan.status === 'granted' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-rose-500/50 bg-rose-500/10'
                }`}>
                  {rfidScan.status === 'granted' ? (
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
                      <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-2 relative z-10" />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse"></div>
                      <XCircle className="h-16 w-16 text-rose-500 mb-2 relative z-10" />
                    </div>
                  )}
                  <h3 className="text-2xl font-bold">{rfidScan.name}</h3>
                  <p className="text-muted-foreground mb-4">Balaji Mining Services</p>
                  <div className={`text-xl font-black tracking-widest ${
                    rfidScan.status === 'granted' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {rfidScan.status === 'granted' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground opacity-50">
                  <div className="h-28 w-28 border-[3px] border-dashed rounded-full border-muted-foreground/50 animate-[spin_10s_linear_infinite] mb-4 flex items-center justify-center relative">
                    <div className="absolute inset-2 border-[3px] border-dashed rounded-full border-muted-foreground/30 animate-[spin_7s_linear_infinite_reverse]"></div>
                    <span className="font-mono text-[10px] animate-none">AWAITING</span>
                  </div>
                </div>
              )}
            </CardContent>
          </MagicCard>
        </motion.div>
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
        }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* AI Document Upload Zone */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
          <MagicCard className="shadow-lg border-border/50 h-full bg-card text-foreground">
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
                className={`relative border-2 border-dashed rounded-xl p-8 text-center overflow-hidden transition-all duration-300 ${
                  isDragActive ? 'border-emerald-400 bg-emerald-900/20 scale-[1.02]' : 
                  ocrResult.status !== 'idle' && ocrResult.status !== 'error' ? 'border-primary/50 bg-primary/5' :
                  'border-border hover:bg-muted hover:border-slate-500 cursor-pointer'
                }`}
              >
                <input {...getInputProps()} />
                
                {/* Scan Beam Animation */}
                <AnimatePresence>
                  {['uploading', 'scanning', 'parsing'].includes(ocrResult.status) && (
                    <motion.div
                      initial={{ top: '-10%' }}
                      animate={{ top: '110%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-primary/30 to-primary shadow-[0_4px_12px_rgba(255,255,255,0.2)] z-10 opacity-70 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-20">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-700 transition-colors">
                    <UploadCloud className="h-8 w-8 text-muted-foreground/80" />
                  </div>
                  <p className="font-medium">{t("drag_drop_files_here", "Drag & drop files here")}</p>
                  <p className="text-xs text-muted-foreground mt-2">{t("supports_pdf_jpeg_png_max_10mb", "Supports PDF, JPEG, PNG (Max 1MB)")}</p>
                </div>
              </div>
              
              <OcrResultPanel 
                result={ocrResult} 
                fileName={acceptedFiles[0]?.name || "Scanned Document"} 
                onReset={resetOCR} 
              />
            </CardContent>
          </MagicCard>
        </motion.div>
        
        {/* Worker Management */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="lg:col-span-2">
          <MagicCard className="shadow-lg border-border/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-500" /> Manage Mine Workers
                </CardTitle>
                <CardDescription>View roster, status, and shift assignments</CardDescription>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="hidden sm:flex border-border bg-background/50 backdrop-blur">Download Roster</Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="h-4 w-4 mr-1" /> Add Worker</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workersData.map((worker) => (
                  <div key={worker.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-card/60 border border-border/50 rounded-xl hover:border-emerald-500/30 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-[2px] transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/20">
                        {worker.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-emerald-500 transition-colors">{worker.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{worker.id}</span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                          <span>{worker.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Shift</div>
                        <div className="text-sm font-medium">{worker.shift}</div>
                      </div>
                      <Badge variant="outline" className={`px-3 py-1 ${
                        worker.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {worker.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </MagicCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
