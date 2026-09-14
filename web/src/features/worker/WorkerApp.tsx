import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert, MapPin, Clock, Trophy, PhoneCall, AlertTriangle, ShieldCheck, Megaphone, Menu } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { NumberTicker } from '@/components/ui/number-ticker'

// Basic i18n dictionary for the Worker App
const dict = {
  en: {
    greeting: "Hello",
    role: "Heavy Machinery Operator",
    safetyScore: "Safety Score",
    rank: "Rank",
    shift: "Current Shift",
    shiftTime: "08:00 AM - 04:00 PM",
    zone: "Zone 4 (Active)",
    sos: "SLIDE TO ACTIVATE SOS",
    report: "Report Hazard",
    call: "Call Supervisor",
    alerts: "Recent Alerts",
    alert1: "Blasting scheduled at Zone 2 in 45 mins. Stay clear.",
    alert2: "Air quality index dropping in Level 3.",
    nfc: "Tap ID Card to Mark Attendance",
  },
  hi: {
    greeting: "नमस्ते",
    role: "भारी मशीनरी ऑपरेटर",
    safetyScore: "सुरक्षा स्कोर",
    rank: "रैंक",
    shift: "वर्तमान शिफ्ट",
    shiftTime: "सुबह 08:00 - शाम 04:00",
    zone: "ज़ोन 4 (सक्रिय)",
    sos: "एसओएस (SOS) के लिए स्वाइप करें",
    report: "खतरे की रिपोर्ट करें",
    call: "सुपरवाइज़र को कॉल करें",
    alerts: "हाल के अलर्ट",
    alert1: "45 मिनट में ज़ोन 2 में ब्लास्टिंग। दूर रहें।",
    alert2: "लेवल 3 में वायु गुणवत्ता सूचकांक गिर रहा है।",
    nfc: "हाजिरी के लिए आईडी कार्ड टैप करें",
  }
}

type Lang = 'en' | 'hi'

export function WorkerApp() {
  const [lang, setLang] = useState<Lang>('en')
  const [sosSliding, setSosSliding] = useState(false)
  const [sosActivated, setSosActivated] = useState(false)

  const t = (key: keyof typeof dict['en']) => dict[lang][key]

  const handleSOS = () => {
    setSosSliding(true)
    setTimeout(() => {
      setSosActivated(true)
      setSosSliding(false)
      // Fake reset after 5s
      setTimeout(() => setSosActivated(false), 5000)
    }, 1500)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-muted min-h-screen w-full flex justify-center">
      
      {/* Mobile Frame Constraint (To simulate phone layout on desktop screens) */}
      <div className="w-full max-w-md bg-background min-h-screen shadow-2xl relative flex flex-col">
        
        {/* App Header */}
        <header className="bg-background text-foreground p-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border-2 border-emerald-500">
              <ShieldCheck className="h-5 w-5 text-comet-up" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{t('greeting')}, Ramesh</h1>
              <p className="text-xs text-muted-foreground/70">{t('role')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
              <SelectTrigger className="w-[80px] h-8 bg-muted border-border text-xs">
                <SelectValue placeholder="Lang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 flex flex-col gap-5 overflow-y-auto pb-24">
          
          {/* Shift & Location Card */}
          <Card className="border-border shadow-sm rounded-xl overflow-hidden">
            <div className="bg-emerald-600 text-foreground p-3 flex justify-between items-center">
              <div className="font-bold flex items-center gap-2">
                <Clock className="h-4 w-4" /> {t('shift')}
              </div>
              <Badge className="bg-comet-up hover:bg-comet-up text-foreground border-0 shadow-none">Live</Badge>
            </div>
            <CardContent className="p-4 bg-[#0ecb81]/10/50">
              <div className="text-xl font-black text-foreground mb-1">{t('shiftTime')}</div>
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <MapPin className="h-4 w-4 text-comet-up" /> {t('zone')}
              </div>
            </CardContent>
          </Card>

          {/* Gamified Safety Score */}
          <Card className="border-border shadow-sm rounded-xl">
            <CardContent className="p-5 flex items-center gap-5">
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="4"
                  />
                  <path
                    className="text-comet-up"
                    strokeDasharray="94, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-foreground"><NumberTicker value={94} /></span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-lg">{t('safetyScore')}</h3>
                <div className="flex items-center gap-1 text-amber-500 font-semibold mt-1 text-sm">
                  <Trophy className="h-4 w-4" /> {t('rank')}: #4 / 150
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions (High Touch Targets) */}
          <div className="grid grid-cols-2 gap-4">
            <Button className="h-24 flex flex-col gap-2 rounded-xl bg-muted text-foreground/80 hover:bg-slate-200 border-2 border-border shadow-sm" variant="outline">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <span className="font-bold text-sm whitespace-normal text-center leading-tight">{t('report')}</span>
            </Button>
            <Button className="h-24 flex flex-col gap-2 rounded-xl bg-muted text-foreground/80 hover:bg-slate-200 border-2 border-border shadow-sm" variant="outline">
              <PhoneCall className="h-8 w-8 text-blue-500" />
              <span className="font-bold text-sm whitespace-normal text-center leading-tight">{t('call')}</span>
            </Button>
          </div>

          {/* Alerts */}
          <div>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" /> {t('alerts')}
            </h3>
            <div className="space-y-3">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg text-sm text-amber-900 shadow-sm font-medium">
                {t('alert1')}
              </div>
              <div className="bg-[#f6465d]/10 border-l-4 border-red-500 p-3 rounded-r-lg text-sm text-comet-down shadow-sm font-medium">
                {t('alert2')}
              </div>
            </div>
          </div>

        </main>

        {/* SOS Footer (Fixed at bottom of mobile view) */}
        <div className="p-4 bg-background border-t border-border sticky bottom-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
          {sosActivated ? (
            <div className="bg-red-600 rounded-full h-16 w-full flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.6)]">
              <span className="text-foreground font-black text-xl uppercase tracking-widest">SOS TRANSMITTED</span>
            </div>
          ) : (
            <div className="relative bg-muted rounded-full h-16 w-full flex items-center overflow-hidden border border-[#f6465d]/30 shadow-inner group">
              <div className="absolute inset-0 flex items-center justify-center text-comet-down/50 font-bold uppercase tracking-widest text-sm z-0">
                {t('sos')}
              </div>
              
              {/* Fake Slider Mechanism */}
              <button 
                onPointerDown={handleSOS}
                className={`absolute h-14 w-14 rounded-full bg-red-600 shadow-lg left-1 z-10 flex items-center justify-center transition-transform duration-[1500ms] ${sosSliding ? 'translate-x-[calc(100vw-5.5rem)] md:translate-x-[360px]' : 'translate-x-0 group-hover:translate-x-2'}`}
              >
                <ShieldAlert className="h-6 w-6 text-foreground" />
              </button>
            </div>
          )}
          
          <div className="text-center mt-4 mb-2 flex flex-col items-center justify-center opacity-40">
            <div className="w-12 h-1 bg-muted rounded-full mb-1"></div>
            <p className="text-[10px] font-bold tracking-widest uppercase">{t('nfc')}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
