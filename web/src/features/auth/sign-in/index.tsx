import { useTranslation } from "react-i18next";
import { Link, useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

const ROLES = [
  { emoji: '👑', label: 'Super Admin', desc: 'Full platform control' },
  { emoji: '🏢', label: 'Corporate & Subsidiary Mgmt', desc: 'Multi-mine oversight' },
  { emoji: '⛏️', label: 'Mine Manager', desc: 'Site-level operations' },
  { emoji: '🔍', label: 'Field Inspector', desc: 'On-ground inspections' },
  { emoji: '🦺', label: 'Safety Official', desc: 'CAPA & incident tracking' },
  { emoji: '🏗️', label: 'Contractor & Vendor', desc: 'Contract compliance' },
]

const STATS = [
  { value: '500+', label: 'Mine Sites' },
  { value: '99.9%', label: 'Uptime' },
  { value: '6', label: 'Role Types' },
  { value: 'AI', label: 'Powered' },
]

export function SignIn() {
  const {
    t
  } = useTranslation();

  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      {/* ── Left Hero Panel ── */}
      <div
        className='hidden lg:flex lg:flex-col lg:flex-1 lg:relative lg:overflow-hidden'
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 40%, #16213e 70%, #0d1117 100%)',
        }}
      >
        {/* Grid overlay */}
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            backgroundImage:
              'linear-gradient(rgba(251,146,60,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(251,146,60,0.05) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          }}
        />
        {/* Ambient orbs */}
        <div
          className='absolute pointer-events-none'
          style={{
            width: 400, height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)',
            top: -120, left: -120,
            animation: 'heroFloat 10s ease-in-out infinite',
          }}
        />
        <div
          className='absolute pointer-events-none'
          style={{
            width: 280, height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)',
            bottom: 60, right: -60,
            animation: 'heroFloat 8s ease-in-out infinite reverse',
          }}
        />
        <div
          className='absolute pointer-events-none'
          style={{
            width: 180, height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(234,88,12,0.15) 0%, transparent 70%)',
            top: '45%', left: '55%',
            animation: 'heroFloat 12s ease-in-out infinite',
            animationDelay: '-4s',
          }}
        />

        <style>{`
          @keyframes heroFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            40% { transform: translateY(-28px) scale(1.04); }
            70% { transform: translateY(18px) scale(0.97); }
          }
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateX(-16px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .role-row {
            border: 1px solid rgba(251,146,60,0.14);
            background: rgba(251,146,60,0.04);
            border-radius: 12px;
            padding: 10px 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.25s ease;
            animation: fadeSlideIn 0.4s ease both;
          }
          .role-row:hover {
            border-color: rgba(251,146,60,0.35);
            background: rgba(251,146,60,0.09);
            transform: translateX(6px);
          }
        `}</style>

        {/* Content */}
        <div className='relative z-10 flex flex-col justify-between h-full px-12 py-12'>
          {/* Top: Branding */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 999,
                padding: '6px 16px',
                marginBottom: 40,
              }}
            >
              <span style={{ fontSize: 18 }}>{t("text", "⛏️")}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500, letterSpacing: '0.05em' }}>{t("ministry_of_coal_coal_india_li", "Ministry of Coal · Coal India Limited")}</span>
            </div>

            <h1
              style={{
                fontSize: 38,
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.15,
                marginBottom: 16,
                letterSpacing: '-0.02em',
              }}
            >{t("smart_governance", "Smart Governance")}<br />
              <span style={{ background: 'linear-gradient(90deg, #f97316, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t("for_coal_mines", "for Coal Mines")}</span>
            </h1>

            <p
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.5)',
                maxWidth: 420,
                lineHeight: 1.65,
                marginBottom: 36,
              }}
            >{t(
              "an_ai_enabled_compliance_monit",
              "An AI-enabled compliance monitoring platform unifying inspections,\n              statutory reporting, contractor management, and field operations\n              across all Indian coal mine sites."
            )}</p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 44 }}>
              {STATS.map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fb923c' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Roles */}
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>{t("platform_roles", "Platform Roles")}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ROLES.map((r, i) => (
                  <div key={r.label} className='role-row' style={{ animationDelay: `${i * 60}ms` }}>
                    <div
                      style={{
                        width: 34, height: 34,
                        borderRadius: 8,
                        background: 'linear-gradient(135deg, rgba(249,115,22,0.6), rgba(234,88,12,0.8))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(249,115,22,0.25)',
                      }}
                    >
                      {r.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.88)' }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom: Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{t(
              "system_operational_sih_2026_sm",
              "System operational · SIH 2026 · Smart Automation"
            )}</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className='flex flex-1 items-center justify-center bg-background text-foreground px-6 py-12'>
        <div className='w-full max-w-sm'>
          {/* Mobile branding */}
          <div className='flex items-center gap-3 mb-8 lg:hidden'>
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}
            >{t("text", "⛏️")}</div>
            <div>
              <div className='font-bold text-sm'>{t("coal_mine_governance", "Coal Mine Governance")}</div>
              <div className='text-xs text-muted-foreground'>{t("ministry_of_coal_cil", "Ministry of Coal · CIL")}</div>
            </div>
          </div>

          <Card className='border-border/60 shadow-xl'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-xl font-bold tracking-tight'>{t("welcome_back", "Welcome back")}</CardTitle>
              <CardDescription className='text-sm'>{t("sign_in_to_your_governance_acc", "Sign in to your governance account.")}{' '}
                <Link
                  to='/sign-up'
                  className='font-medium text-primary underline underline-offset-4 hover:text-primary/80'
                >{t("create_an_account", "Create an account")}</Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserAuthForm redirectTo={redirect} />
            </CardContent>
            <CardFooter className='pt-0'>
              <p className='text-center text-xs text-muted-foreground w-full'>{t("by_signing_in_you_agree_to_our", "By signing in, you agree to our")}{' '}
                <a href='/terms' className='underline underline-offset-4 hover:text-primary'>{t("terms_of_service", "Terms of Service")}</a>{' '}{t("and", "and")}{' '}
                <a href='/privacy' className='underline underline-offset-4 hover:text-primary'>{t("privacy_policy", "Privacy Policy")}</a>{t("text", ".")}</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AuthLayout>
  );
}
