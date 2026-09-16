import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScanFace, CheckCircle2, XCircle, AlertTriangle, Fingerprint, Clock, UserCheck } from 'lucide-react'

// Mock Data
const mockRecentScans = [
  { id: 'W-9912', name: 'Ramesh Kumar', role: 'Heavy Operator', time: 'Just now', status: 'authorized' },
  { id: 'W-8831', name: 'Suresh Singh', role: 'Blaster', time: '2 mins ago', status: 'authorized' },
  { id: 'C-1029', name: 'Vendor #412', role: 'Delivery', time: '5 mins ago', status: 'denied', reason: 'Invalid Shift' },
  { id: 'W-7711', name: 'Priya Sharma', role: 'Safety Officer', time: '12 mins ago', status: 'authorized' },
]

export function GateKioskDashboard() {
  const [scanState, setScanState] = useState<'waiting' | 'scanning' | 'authorized' | 'denied'>('waiting')
  const [activeWorker, setActiveWorker] = useState<any>(null)

  // Simulate a scan cycle every 10 seconds
  useEffect(() => {
    const cycle = setInterval(() => {
      setScanState('scanning')
      
      setTimeout(() => {
        const isSuccess = Math.random() > 0.3
        setScanState(isSuccess ? 'authorized' : 'denied')
        
        if (isSuccess) {
          setActiveWorker({
            id: `W-${Math.floor(1000 + Math.random() * 9000)}`,
            name: 'Rahul Verma',
            role: 'Excavator Operator',
            shift: 'Shift A (08:00 - 16:00)',
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul&backgroundColor=b6e3f4'
          })
        } else {
          setActiveWorker({
            id: `U-${Math.floor(1000 + Math.random() * 9000)}`,
            name: 'Unknown Individual',
            reason: 'Face not matched in database',
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown&backgroundColor=ffdfbf'
          })
        }

        // Reset back to waiting
        setTimeout(() => {
          setScanState('waiting')
          setActiveWorker(null)
        }, 4000)

      }, 1500)
    }, 10000)

    return () => clearInterval(cycle)
  }, [])

  return (
    <div className="flex-1 p-4 md:p-6 bg-slate-950 min-h-screen text-slate-200 w-full flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
            <ScanFace className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">Main Gate Kiosk #4</h1>
            <p className="text-slate-400 text-sm">Automated Biometric Access Control</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-mono text-slate-400">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> 08:42:15 AM</div>
          <div className="h-8 w-px bg-slate-800"></div>
          <Button variant="outline" className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800">
            Manual Override
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Biometric Viewfinder (Left Side) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative shadow-2xl">
          {/* Fake Camera Feed Background */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888087573-f53154226186?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale blur-[2px]"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Viewfinder Reticle */}
            <div className={`relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] border-2 border-dashed rounded-3xl transition-colors duration-500 overflow-hidden flex items-center justify-center
              ${scanState === 'waiting' ? 'border-slate-500' : 
                scanState === 'scanning' ? 'border-blue-500' : 
                scanState === 'authorized' ? 'border-emerald-500 bg-emerald-500/10' : 
                'border-red-500 bg-red-500/10'}`}
            >
              
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-xl border-current"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-xl border-current"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-xl border-current"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-xl border-current"></div>

              {/* Scanning Animation */}
              {scanState === 'scanning' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_15px_#60a5fa] animate-[scan_1.5s_ease-in-out_infinite]"></div>
              )}

              {/* Status Icon Overlay */}
              {scanState === 'authorized' && <CheckCircle2 className="h-32 w-32 text-emerald-500 animate-in zoom-in duration-300" />}
              {scanState === 'denied' && <XCircle className="h-32 w-32 text-red-500 animate-in zoom-in duration-300" />}
              {scanState === 'waiting' && <Fingerprint className="h-20 w-20 text-slate-500/50" />}

            </div>
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur px-6 py-2 rounded-full border border-slate-700 font-mono text-sm tracking-widest uppercase">
            {scanState === 'waiting' && <span className="text-slate-400 animate-pulse">Awaiting Subject...</span>}
            {scanState === 'scanning' && <span className="text-blue-400">Analyzing Biometrics...</span>}
            {scanState === 'authorized' && <span className="text-emerald-400">Match Confirmed</span>}
            {scanState === 'denied' && <span className="text-red-400">Alert: Mismatch</span>}
          </div>
        </div>

        {/* Right Side Panels */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full min-h-0">
          
          {/* Scan Result Panel */}
          <Card className={`shrink-0 border-2 shadow-lg transition-colors duration-300
            ${scanState === 'waiting' || scanState === 'scanning' ? 'bg-slate-900 border-slate-800' : 
              scanState === 'authorized' ? 'bg-emerald-950 border-emerald-500/50' : 
              'bg-red-950 border-red-500/50'}`}
          >
            <CardContent className="p-6">
              {scanState === 'waiting' || scanState === 'scanning' ? (
                <div className="h-[180px] flex flex-col items-center justify-center text-slate-500 gap-4">
                  <UserCheck className="h-12 w-12 opacity-20" />
                  <p className="text-lg font-medium">Ready for next scan</p>
                </div>
              ) : activeWorker ? (
                <div className="flex gap-6 items-center">
                  <img src={activeWorker.photo} alt="Worker" className="w-32 h-32 rounded-xl border-4 border-slate-800 bg-slate-800" />
                  <div>
                    <h2 className="text-3xl font-black text-white mb-1">{activeWorker.name}</h2>
                    <div className="font-mono text-slate-400 mb-3">{activeWorker.id}</div>
                    
                    {scanState === 'authorized' ? (
                      <div className="space-y-1">
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white border-0 text-sm">{activeWorker.role}</Badge>
                        <p className="text-sm text-emerald-400/80 mt-2 font-medium">{activeWorker.shift}</p>
                      </div>
                    ) : (
                      <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{activeWorker.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Recent Scans Feed */}
          <Card className="flex-1 bg-slate-900 border-slate-800 flex flex-col overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
              <h3 className="font-bold text-slate-300 uppercase tracking-wider text-sm">Recent Activity Log</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mockRecentScans.map((scan, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${scan.status === 'authorized' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <div>
                      <div className="font-bold text-slate-200">{scan.name}</div>
                      <div className="text-xs text-slate-400">{scan.id} &bull; {scan.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1">{scan.time}</div>
                    {scan.status === 'authorized' ? (
                      <span className="text-xs font-bold text-emerald-400 uppercase">Passed</span>
                    ) : (
                      <span className="text-xs font-bold text-red-400 uppercase">Blocked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
        </div>
      </div>
      
      {/* Global Styles for Custom Animations */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  )
}
