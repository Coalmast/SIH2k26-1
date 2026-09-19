import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { MineSelector } from '@/components/shared/MineSelector'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Bell, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from '@tanstack/react-router'
import { useComplianceInstances } from '@/features/compliance/hooks/useCompliance'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

// Map paths to human-readable page titles
const PAGE_TITLES: Record<string, { title: string; subtitle: string; icon?: React.ElementType }> = {
  '/':                         { title: 'Dashboard',            subtitle: 'Real-time mine operations overview' },
  '/compliance':               { title: 'Compliance',           subtitle: 'EPA 1986 · CMR 2017 · Auto-monitored by COMET', icon: ShieldCheck },
  '/inspection':               { title: 'Inspections',          subtitle: 'Field inspection management and tracking' },
  '/grievances':               { title: 'Grievances',           subtitle: 'Worker grievance reporting and resolution' },
  '/reports':                  { title: 'Reports',              subtitle: 'Automated regulatory and operational reporting' },
  '/mine-map':                 { title: 'Mine Map',             subtitle: 'GIS-based mine site visualization' },
  '/alerts':                   { title: 'Alerts',               subtitle: 'System alerts and escalations' },
  '/workers':                  { title: 'Workers',              subtitle: 'Workforce management and attendance' },
  '/contractors':              { title: 'Contractors',          subtitle: 'Contract and contractor management' },
  '/settings':                 { title: 'Settings',             subtitle: 'System preferences and configuration' },
  '/start-inspection':         { title: 'Start Inspection',     subtitle: 'Initiate a new field inspection' },
  '/report-incident':          { title: 'Report Incident',      subtitle: 'Log a safety incident or near-miss' },
}

function getPageInfo(pathname: string) {
  // Try exact match first, then prefix match
  const exact = PAGE_TITLES[pathname]
  if (exact) return exact
  const prefix = Object.keys(PAGE_TITLES)
    .filter((k) => k !== '/' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  return PAGE_TITLES[prefix] ?? { title: 'COMET', subtitle: 'AI-enabled governance platform' }
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)
  const location = useLocation()
  const pageInfo = getPageInfo(location.pathname)

  // Live compliance health indicator
  const { data: instances } = useComplianceInstances(undefined, undefined)
  const breachedCount = (instances || []).filter((i: any) => i.status === 'breached').length
  const totalCount = (instances || []).length
  const healthPct = totalCount > 0 ? Math.round(((totalCount - breachedCount) / totalCount) * 100) : 100

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }
    document.addEventListener('scroll', onScroll, { passive: true })
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  const isScrolled = offset > 10 && fixed

  return (
    <header
      className={cn(
        'z-50 border-b border-border/60',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        isScrolled ? 'shadow-sm' : 'shadow-none',
        isScrolled && 'bg-background/80 backdrop-blur-xl border-border/40',
        !isScrolled && 'bg-background',
        'transition-all duration-300',
        className
      )}
      {...props}
    >
      <div className="relative flex h-14 items-center gap-3 px-4">
        {/* Sidebar trigger */}
        <SidebarTrigger
          variant='ghost'
          className='text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
        />
        <Separator orientation='vertical' className='h-5 bg-border/60' />

        {/* Page title — animated on route change */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: -12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 12, filter: 'blur(4px)' }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5 min-w-0"
          >
            {pageInfo.icon && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                <pageInfo.icon className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground leading-none">
                  {pageInfo.title}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-none truncate max-w-64 hidden sm:block">
                {pageInfo.subtitle}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Any page-injected children (breadcrumbs etc.) */}
        {children && (
          <>
            <Separator orientation='vertical' className='h-5 bg-border/60' />
            <div className="flex-1 flex items-center">{children}</div>
          </>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Live system health pill */}
        <AnimatePresence>
          {totalCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'hidden md:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums',
                healthPct >= 80
                  ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400'
                  : healthPct >= 60
                  ? 'border-amber-500/30 bg-amber-500/8 text-amber-600 dark:text-amber-400'
                  : 'border-red-500/30 bg-red-500/8 text-red-600 dark:text-red-400'
              )}
            >
              <span className={cn(
                'h-1.5 w-1.5 rounded-full',
                healthPct >= 80 ? 'bg-emerald-500' : healthPct >= 60 ? 'bg-amber-500' : 'bg-red-500'
              )} />
              {healthPct}% Compliant
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right side controls */}
        <div className="flex items-center gap-1">
          <MineSelector />

          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Bell className="h-4 w-4" />
            {breachedCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1.5 h-2 w-2 bg-destructive rounded-full border-2 border-background"
              />
            )}
          </Button>

          <LanguageSwitcher />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </div>

      {/* Bottom accent line — orange gradient that fades in when scrolled */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent origin-center"
          />
        )}
      </AnimatePresence>
    </header>
  )
}
