import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ComplianceCalendar } from '@/features/compliance/components/ComplianceCalendar'
import { ComplianceKanban } from '@/features/compliance/components/ComplianceKanban'
import { Main } from '@/components/layout/main'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Kanban, Cpu, Sparkles, TrendingUp, ShieldCheck, AlertOctagon, Clock, Download, Filter, Search, Activity, BrainCircuit, CheckCircle2, PanelRight } from 'lucide-react'
import { useComplianceInstances } from '@/features/compliance/hooks/useCompliance'
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar'
import { AnimatedList } from '@/components/ui/animated-list'
import { MagicCard } from '@/components/ui/magic-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NumberTicker } from '@/components/ui/number-ticker'

export const Route = createFileRoute('/_authenticated/compliance/')({
  component: CompliancePage,
})

const recentActivities = [
  { time: "Just now", text: "System generated monthly Water Quality checklist.", icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10" },
  { time: "2m ago", text: "John Doe submitted Dust Suppression Report.", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { time: "1hr ago", text: "COMET AI flagged missing medical certs for 12 workers.", icon: AlertOctagon, color: "text-amber-500", bg: "bg-amber-500/10" },
  { time: "3hr ago", text: "Safety Official approved Ventilation Audit.", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { time: "1d ago", text: "Mine Manager assigned Corrective Action #420.", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-500/10" },
];

function CompliancePage() {
  const { t } = useTranslation();
  const [view, setView] = useState<'kanban' | 'calendar'>('calendar')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeStatus, setActiveStatus] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { data: instances } = useComplianceInstances(undefined, undefined);

  const pending = (instances || []).filter((i: any) => i.status === 'pending').length
  const breached = (instances || []).filter((i: any) => i.status === 'breached').length
  const approved = (instances || []).filter((i: any) => i.status === 'approved').length
  const inProgress = (instances || []).filter((i: any) => i.status === 'in_progress').length
  const total = pending + breached + approved + inProgress;
  const healthScore = total > 0 ? Math.round(((total - breached) / total) * 100) : 100;

  const stats = [
    { id: 'pending', label: 'Pending', value: pending, icon: Clock, color: 'from-amber-500/10 to-transparent dark:from-amber-500/20 dark:to-amber-500/5', border: 'border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', glow: 'shadow-amber-500/10' },
    { id: 'in_progress', label: 'In Progress', value: inProgress, icon: TrendingUp, color: 'from-blue-500/10 to-transparent dark:from-blue-500/20 dark:to-blue-500/5', border: 'border-blue-500/30', text: 'text-blue-600 dark:text-blue-400', glow: 'shadow-blue-500/10' },
    { id: 'approved', label: 'Approved', value: approved, icon: ShieldCheck, color: 'from-emerald-500/10 to-transparent dark:from-emerald-500/20 dark:to-emerald-500/5', border: 'border-emerald-500/30', text: 'text-emerald-600 dark:text-emerald-400', glow: 'shadow-emerald-500/10' },
    { id: 'breached', label: 'Breached', value: breached, icon: AlertOctagon, color: 'from-red-500/10 to-transparent dark:from-red-500/20 dark:to-red-500/5', border: 'border-red-500/30', text: 'text-red-600 dark:text-red-400', glow: 'shadow-red-500/10' },
  ]

  const CATEGORIES = [
    { id: 'environment', label: 'Environment' },
    { id: 'safety', label: 'Safety' },
    { id: 'dgms', label: 'DGMS Mandatory' },
  ]

  return (
    <Main fluid className='flex flex-1 flex-row gap-0 overflow-hidden p-0 bg-background'>
      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0 border-r border-border/50">
        
        {/* Premium Header */}
        <div className="relative overflow-hidden border-b border-border/50 px-6 py-5 shrink-0">
          <div className="pointer-events-none absolute -top-16 left-1/4 h-48 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -top-16 right-1/4 h-48 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5">
            {/* Top Row: Title, Filters & Actions */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30"
                >
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </motion.div>
                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className='text-xl font-bold tracking-tight text-foreground'
                  >
                    {t("compliance_management", "Compliance Management")}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className='text-xs text-muted-foreground mt-0.5'
                  >
                    Manage inspections, reports, and regulatory tasks
                  </motion.p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Category Filters */}
                <div className="hidden lg:flex items-center gap-1.5 mr-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                        activeCategory === cat.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search tasks..." className="w-64 pl-8 bg-muted/40 border-border/60" />
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`bg-muted/40 border-border/60 shrink-0 transition-colors ${isSidebarOpen ? 'bg-primary/20 text-primary border-primary/30' : ''}`}
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  title="Toggle Analytics Sidebar"
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
                <Button className="bg-primary hover:bg-primary/90 shrink-0 gap-2 text-primary-foreground shadow-sm">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </div>
            </div>

            {/* Bottom Row: Health Score, Stats & View Toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                {/* Health Score */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-4 bg-muted/30 p-2 pr-4 rounded-xl border border-border/40"
                >
                  <AnimatedCircularProgressBar
                    max={100}
                    min={0}
                    value={healthScore}
                    gaugePrimaryColor={healthScore >= 90 ? "rgb(16 185 129)" : healthScore >= 70 ? "rgb(245 158 11)" : "rgb(239 68 68)"}
                    gaugeSecondaryColor="currentColor"
                    className="size-12 text-sm font-bold text-muted-foreground/20"
                  />
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mine Health</div>
                    <div className="text-sm font-semibold">Overall Compliance</div>
                  </div>
                </motion.div>

                {/* Stats */}
                <div className="flex items-center gap-2">
                  {stats.map((stat, i) => (
                    <motion.button
                      key={stat.label}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => setActiveStatus(activeStatus === stat.id ? null : stat.id)}
                      className={`flex items-center gap-2 rounded-lg border bg-gradient-to-br px-3 py-1.5 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                        activeStatus && activeStatus !== stat.id ? 'opacity-40 grayscale' : ''
                      } ${
                        activeStatus === stat.id ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
                      } ${stat.border} ${stat.color} ${stat.glow}`}
                    >
                      <stat.icon className={`h-3.5 w-3.5 ${stat.text}`} />
                      <span className={`text-lg font-bold tabular-nums leading-none ${stat.text}`}>
                        <NumberTicker value={stat.value} className={stat.text} />
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground">{stat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* View Toggle */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-1 backdrop-blur-sm"
              >
                {[
                  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
                  { id: 'kanban', label: 'Kanban', icon: Kanban },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id as any)}
                    className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                      view === v.id
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {view === v.id && (
                      <motion.div
                        layoutId="view-pill"
                        className="absolute inset-0 rounded-lg bg-primary"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <v.icon className="relative z-10 h-4 w-4" />
                    <span className="relative z-10">{v.label}</span>
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* View Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden bg-muted/10">
          <AnimatePresence mode="wait" initial={false}>
            {view === 'calendar' ? (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.25 }}
                className="flex flex-1 min-h-0 p-4"
              >
                <ComplianceCalendar filterStatus={activeStatus} filterCategory={activeCategory} />
              </motion.div>
            ) : (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(4px)' }}
                transition={{ duration: 0.25 }}
                className="flex flex-1 min-h-0 overflow-hidden p-4"
              >
                <ComplianceKanban filterStatus={activeStatus} filterCategory={activeCategory} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="shrink-0 flex flex-col h-full bg-sidebar border-l border-sidebar-border z-10 overflow-hidden"
          >
            <div className="w-[320px] flex flex-col h-full">
        
        {/* Activity Feed Section */}
        <div className="flex-1 min-h-0 flex flex-col p-4">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Live Activity</h3>
            <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar mask-image-[linear-gradient(to_bottom,black_80%,transparent_100%)]">
            <AnimatedList delay={2500} className="items-stretch pb-4">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex flex-col gap-1.5 p-3 rounded-xl border border-border/50 bg-background hover:bg-muted/50 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-md ${act.bg}`}>
                      <act.icon className={`h-3.5 w-3.5 ${act.color}`} />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{act.time}</span>
                  </div>
                  <p className="text-xs text-foreground/90 mt-1 leading-snug">
                    {act.text}
                  </p>
                </div>
              ))}
            </AnimatedList>
          </div>
        </div>

        {/* AI Analytics Section */}
        <div className="p-4 pt-0 shrink-0">
          <MagicCard 
            mode="orb" 
            glowOpacity={0.4} 
            className="flex flex-col w-full p-4 bg-background backdrop-blur-md rounded-2xl border-border/50 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-primary bg-clip-text text-transparent">COMET Insights</h3>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed mb-4 relative z-50">
              Analysis of historical regulatory data suggests a <span className="font-semibold text-amber-400">75% probability</span> of an unannounced safety audit by the DGMS in the next 14 days.
            </p>
            
            <div className="mt-auto pt-3 border-t border-border/50 relative z-50">
              <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer">
                View Mitigation Plan &rarr;
              </button>
            </div>
          </MagicCard>
        </div>
      </div>
      </motion.div>
      )}
      </AnimatePresence>
    </Main>
  );
}
