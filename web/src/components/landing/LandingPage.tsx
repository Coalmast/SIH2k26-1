import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAuthStore } from '@/stores/auth-store'
import { BentoGrid } from './BentoGrid'
import { ThreeHero } from './ThreeHero'
import { containerVariants, itemVariants, pageVariants } from './animations'
import './landing.css'

gsap.registerPlugin(ScrollTrigger)

/* ─── PROBLEM SECTION data ─── */
const problems = [
  {
    title: 'No trail from the field',
    desc: 'Observations, violations and corrective actions sit in paper registers. Nobody sees them until someone physically reads the register — days later.',
  },
  {
    title: 'No early warning',
    desc: 'Recurring failures go unnoticed until something catastrophic goes wrong. There is no layer that watches the pattern and flags it before the incident.',
  },
  {
    title: 'Reports made by hand',
    desc: 'Statutory reports to DGMS and SPCB take days to compile, and the same numbers are laboriously copied between spreadsheets across mine offices.',
  },
]

/* ─── ROLE LAYERS ─── */
const roleLayers = [
  {
    depth: '0 m',
    label: 'Head Office & Regulator',
    color: '#1e3a4a',
    accent: '#38bdf8',
    title: 'See every mine from one screen.',
    desc: 'One dashboard across mines and subsidiaries. Total mines, inspections done against plan, violations and compliance — no roll-up phone calls, no waiting for a subsidiary report.',
    features: [
      'National dashboard across all subsidiaries',
      'Live critical, high and low priority alerts',
      'Compliance overview — compare mines side by side',
      'Production analytics — output, dispatch, active machinery',
      'AI risk intelligence with reasoning',
      'Environmental summary — air, dust and noise',
      'Contractor trust map — compliance compared',
      'Emergency broadcast to all operational units',
    ],
  },
  {
    depth: '−120 m',
    label: 'Mine Office',
    color: '#2b1e0e',
    accent: '#f59e0b',
    title: 'One screen. Every deadline, violation and reading.',
    desc: 'The Mine Manager runs the mine from a live command center. Deadlines from the Mines Act, CMR 2017, the EP Act and CLRA are created, reminded and auto-escalated.',
    features: [
      'Live command dashboard for the full mine',
      'Auto-created compliance tasks from Acts and rules',
      'Corrective actions that require evidence to close',
      'Incident investigation — Form 4-A filing',
      'AQI, PM10, noise monitoring with sensor map',
      'Digitally signed statutory reports, auto-populated',
      'Safety officer workspace with same live records',
      'Escalation from officer → Manager → DGMS automatically',
    ],
  },
  {
    depth: '−300 m',
    label: 'Working Face',
    color: '#1a2030',
    accent: '#818cf8',
    title: 'Underground has no signal. The app does not need one.',
    desc: 'Field inspectors record everything on the phone, geo-tagged and time-stamped. When a reading is dangerous, the alert fires on the device itself — no network needed.',
    features: [
      'Offline-first field inspection app',
      'Checklists from the regulation library',
      'Geo-tagged, time-stamped every record',
      'Photo evidence attached to each observation',
      'On-device evacuation alarm (no network needed)',
      'QR attendance — geofenced, night-shift limits',
      'Incident reporting on the spot',
      'SOS and emergency notifications',
    ],
  },
  {
    depth: '−420 m',
    label: 'AI Layer',
    color: '#120d20',
    accent: '#c084fc',
    title: 'AI that warns early and shows its reasoning.',
    desc: 'Built on Google Gemini and the Agent Development Kit. Scores every mine, flags anomalies, drafts statutory reports, and understands worker voice in five languages. The AI advises — people decide.',
    features: [
      'Risk scoring from violations, closure rates, gas readings',
      'Anomaly and pattern detection before incidents',
      'Statutory report drafting from live data',
      'Grievance understanding in 5 languages',
      'OCR reading of contractor documents',
      'Human-in-the-loop: low confidence → human review',
      'Evidence required before closing corrective actions',
      'Digital signature required before report submission',
    ],
  },
]

/* ─── IMPACT TABLE data ─── */
const impactRows = [
  ['A field problem reaches the manager in days, by phone or register.', 'Minutes after the phone syncs.'],
  ['Deadlines live in diaries and wall charts.', 'Tasks are created, reminded and escalated automatically.'],
  ['Statutory reports take days to compile.', 'Auto-populated, digitally signed and submitted.'],
  ['Contractor papers are checked by hand.', 'OCR reads them; a person confirms the doubtful ones.'],
  ['Risk is understood after an incident.', 'A live score with reasons, before the incident.'],
  ['Workers use complaint boxes.', 'Voice in five languages, routed to the right officer.'],
]

/* ─── SCORECARD data ─── */
const scorecard = [
  'Track statutory compliance across safety, environment, production and labour',
  'Real-time monitoring of inspections, observations, violations and corrective actions',
  'AI to identify high-risk areas',
  'AI for recurring failures and operational anomalies',
  'Predictive environmental alerts (PM10, AQI, noise)',
  'Geo-tagged, time-stamped field reporting',
  'Mobile app with offline support — inspections, observations, attendance, incidents',
  'Dashboards for mine officials, corporate management and regulators',
  'Automated alerts, reminders, compliance reports and escalation',
  'Digital approvals and statutory report generation',
  'GIS mapping with PostGIS and MapLibre',
  'OCR document digitisation with human-in-the-loop review',
  'Secure, tamper-evident SHA-256 audit trail',
  'Contractor management — licences, medicals, RFID attendance',
  'Grievance handling — multilingual and by voice',
  'Production reporting and environmental monitoring',
  'Scalable across mines and subsidiaries via configuration',
  'Less paperwork, more transparency and accountability',
]

/* ─── TECH STACK ─── */
const techStack = [
  { label: 'Field App', value: 'React Native + Expo', sub: 'Offline store · Geo-tagging · QR scan · Voice' },
  { label: 'Backend', value: 'FastAPI + Supabase', sub: 'Postgres · PostGIS · Realtime updates' },
  { label: 'Dashboards', value: 'React + MapLibre', sub: 'DeckGL · Five role-based dashboards' },
  { label: 'AI Agents', value: 'Google Gemini + ADK', sub: 'Risk scoring · Anomaly · OCR · NLP' },
]

/* ─── ROADMAP ─── */
const roadmap = [
  { phase: 'Phase 1', title: 'Pilot at one mine', desc: 'Prove the field-to-manager loop with real inspectors.', color: '#f97316' },
  { phase: 'Phase 2', title: 'One subsidiary', desc: 'Add corporate dashboards, contractors and statutory reports.', color: '#f59e0b' },
  { phase: 'Phase 3', title: 'All subsidiaries', desc: 'Repeat the same design across Coal India. Proposed rollout.', color: '#ef4444' },
]

/* ─── GSAP reveal helper ─── */
function useScrollReveal(ref: React.RefObject<HTMLElement | null>, delay = 0) {
  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { y: 48, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.75, delay, ease: 'power2.out',
          scrollTrigger: { trigger: ref.current, start: 'top 82%' }
        }
      )
    })
    return () => ctx.revert()
  }, [])
}

/* ─── PROBLEM SECTION ─── */
function ProblemSection() {
  const headRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useScrollReveal(headRef as React.RefObject<HTMLElement>)

  useEffect(() => {
    if (!cardsRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(cardsRef.current!.querySelectorAll('.problem-card'),
        { y: 48, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.12, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' }
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section style={{ background: '#0f0d0c', padding: '7rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div ref={headRef}>
          <div className="depth-label">0 m · The Problem</div>
          <h2 className="lp-h2" style={{ maxWidth: '22ch' }}>
            Today, a fault underground takes days to reach the manager and weeks to reach the regulator.
          </h2>
          <p style={{ color: '#a8a29e', fontSize: '1.1rem', maxWidth: '60ch', lineHeight: 1.65, marginTop: '0.75rem', marginBottom: '3rem' }}>
            Compliance lives in paper registers and spreadsheets spread across mines, contractors and field offices. By the time anyone reads the evidence, it is old.
          </p>
        </div>

        {/* Speed comparison bars */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: '#a8a29e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Time to reach mine manager
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ minWidth: '90px', fontSize: '0.85rem', color: '#a8a29e' }}>On paper</span>
            <div className="comp-bar-track" style={{ flex: 1 }}>
              <div className="comp-bar-seg comp-bar-seg-paper" style={{ width: '14%' }}>Notebook</div>
              <div className="comp-bar-seg comp-bar-seg-paper" style={{ width: '16%' }}>Register</div>
              <div className="comp-bar-seg comp-bar-seg-paper" style={{ width: '32%' }}>Manager</div>
              <div className="comp-bar-seg comp-bar-seg-paper" style={{ width: '38%' }}>DGMS</div>
            </div>
            <span style={{ minWidth: '60px', fontSize: '0.8rem', color: '#a8a29e', textAlign: 'right' }}>Days–Weeks</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ minWidth: '90px', fontSize: '0.85rem', color: '#f97316', fontWeight: 700 }}>On COMET</span>
            <div className="comp-bar-track" style={{ flex: 1 }}>
              <div className="comp-bar-seg comp-bar-seg-comet" style={{ width: '9%', fontSize: '0.75rem' }}>Sync</div>
            </div>
            <span style={{ minWidth: '60px', fontSize: '0.8rem', color: '#f97316', fontWeight: 700, textAlign: 'right' }}>Minutes</span>
          </div>
          <p style={{ color: '#a8a29e', fontSize: '0.82rem', marginTop: '0.5rem' }}>Illustrative — minutes after the phone syncs, visible to every level at once.</p>
        </div>

        {/* Problem cards */}
        <div ref={cardsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '2.5rem' }}>
          {problems.map((p, i) => (
            <div key={i} className="problem-card lp-card" style={{ padding: '1.75rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem', fontSize: '1rem', color: '#f97316', fontWeight: 700
              }}>
                {i + 1}
              </div>
              <h3 style={{ color: '#f5f0eb', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{p.title}</h3>
              <p style={{ color: '#a8a29e', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── ROLE LAYERS SECTION ─── */
function RoleLayersSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.role-card').forEach((card, i) => {
        gsap.fromTo(card,
          { x: i % 2 === 0 ? -60 : 60, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 82%' }
          }
        )
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} style={{ background: '#0a0908', padding: '7rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div className="depth-label" style={{ justifyContent: 'center' }}>
            <span>The Descent</span>
          </div>
          <h2 className="lp-h2" style={{ textAlign: 'center' }}>
            Every role. One platform.
          </h2>
          <p style={{ color: '#a8a29e', fontSize: '1.1rem', maxWidth: '56ch', margin: '0.75rem auto 0', lineHeight: 1.6 }}>
            COMET operates at every depth — from the surface regulator to the underground working face.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {roleLayers.map((layer, idx) => (
            <div
              key={idx}
              className="role-card"
              style={{
                background: '#171412',
                border: '1px solid #2a2420',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
              }}
            >
              {/* Left: depth + title */}
              <div style={{ padding: '2.5rem', background: layer.color, borderRight: `1px solid rgba(255,255,255,0.06)` }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <span style={{
                    fontFamily: 'ui-monospace,monospace', fontWeight: 700, fontSize: '0.8rem',
                    color: layer.accent, background: `${layer.accent}18`, border: `1px solid ${layer.accent}30`,
                    borderRadius: '4px', padding: '3px 10px',
                  }}>{layer.depth}</span>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {layer.label}
                  </span>
                </div>
                <h3 style={{ color: '#f5f0eb', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                  {layer.title}
                </h3>
                <p style={{ color: 'rgba(245,240,235,0.65)', fontSize: '0.9rem', lineHeight: 1.65, margin: 0 }}>
                  {layer.desc}
                </p>
              </div>
              {/* Right: features list */}
              <div style={{ padding: '2.5rem' }}>
                <p style={{ color: '#a8a29e', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  What it includes
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {layer.features.map((feat, fi) => (
                    <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: '#f5f0eb' }}>
                      <svg style={{ minWidth: '14px', marginTop: '3px' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={layer.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── IMPACT TABLE SECTION ─── */
function ImpactSection() {
  const ref = useRef<HTMLDivElement>(null)
  useScrollReveal(ref as React.RefObject<HTMLElement>)

  return (
    <section style={{ background: '#0f0d0c', padding: '7rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div ref={ref}>
          <div className="depth-label">Impact</div>
          <h2 className="lp-h2">What changes for the mine.</h2>
          <p style={{ color: '#a8a29e', fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: '2.5rem' }}>
            Impact targets to be measured in the pilot.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="impact-table">
            <thead>
              <tr>
                <th style={{ color: '#a8a29e', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Today</th>
                <th style={{ color: '#f97316', fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>With COMET</th>
              </tr>
            </thead>
            <tbody>
              {impactRows.map(([before, after], i) => (
                <tr key={i}>
                  <td style={{ color: '#a8a29e', borderTop: '1px solid #2a2420', padding: '1rem' }}>{before}</td>
                  <td style={{ color: '#f97316', fontWeight: 700, borderTop: '1px solid #2a2420', padding: '1rem' }}>{after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ─── TECH STACK + ROADMAP SECTION ─── */
function TechSection() {
  const ref = useRef<HTMLDivElement>(null)
  useScrollReveal(ref as React.RefObject<HTMLElement>)

  return (
    <section style={{ background: '#0a0908', padding: '7rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div ref={ref} style={{ marginBottom: '3rem' }}>
          <div className="depth-label">−420 m · Build</div>
          <h2 className="lp-h2">Built to run, and to scale.</h2>
          <p style={{ color: '#a8a29e', fontSize: '1rem', maxWidth: '56ch', lineHeight: 1.65, marginTop: '0.75rem' }}>
            A working prototype, not a mockup. Adding a mine means adding configuration, not rebuilding software.
          </p>
        </div>

        {/* Tech stack cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '4rem' }}>
          {techStack.map((t, i) => (
            <div key={i} className="lp-card" style={{ padding: '1.5rem' }}>
              <p style={{ color: '#a8a29e', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>{t.label}</p>
              <p style={{ color: '#f5f0eb', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 0.35rem', letterSpacing: '-0.01em' }}>{t.value}</p>
              <p style={{ color: '#a8a29e', fontSize: '0.85rem', margin: 0 }}>{t.sub}</p>
            </div>
          ))}
        </div>

        {/* Roadmap */}
        <h3 style={{ color: '#f5f0eb', fontWeight: 700, fontSize: '1.4rem', marginBottom: '1.5rem' }}>Rollout Phases</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {roadmap.map((r, i) => (
            <div key={i} style={{
              background: '#171412', border: '1px solid #2a2420',
              borderTop: `3px solid ${r.color}`,
              borderRadius: '12px', padding: '1.5rem',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', color: r.color, textTransform: 'uppercase' }}>{r.phase}</span>
              <h4 style={{ color: '#f5f0eb', fontWeight: 700, fontSize: '1.15rem', margin: '0.4rem 0 0.5rem', letterSpacing: '-0.01em' }}>{r.title}</h4>
              <p style={{ color: '#a8a29e', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── SCORECARD SECTION ─── */
function ScorecardSection() {
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useScrollReveal(ref as React.RefObject<HTMLElement>)

  useEffect(() => {
    if (!listRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(listRef.current!.querySelectorAll('li'),
        { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, stagger: 0.04, duration: 0.5, ease: 'power2.out',
          scrollTrigger: { trigger: listRef.current, start: 'top 80%' }
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section style={{ background: '#0f0d0c', padding: '7rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div ref={ref} style={{ marginBottom: '3rem' }}>
          <div className="depth-label">Scorecard</div>
          <h2 className="lp-h2">Checked against the problem statement.</h2>
          <p style={{ color: '#a8a29e', fontSize: '1rem', maxWidth: '56ch', lineHeight: 1.65, marginTop: '0.75rem' }}>
            Smart India Hackathon 2026, PS 26024, Coal India Limited, Ministry of Coal.
          </p>
        </div>

        <ul ref={listRef} style={{ listStyle: 'none', margin: 0, padding: 0, columnCount: 2, columnGap: '2.5rem' }}>
          {scorecard.map((item, i) => (
            <li key={i} style={{ breakInside: 'avoid', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.8rem 0', borderTop: '1px solid #2a2420' }}>
              <span className="tick-green">✓</span>
              <span style={{ color: '#f5f0eb', fontSize: '0.9rem', lineHeight: 1.5 }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ─── NAVBAR ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(10,9,8,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid #2a2420' : '1px solid transparent',
      transition: 'all 300ms ease',
      padding: '0 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 900, fontSize: '1.4rem', color: '#f97316', letterSpacing: '0.04em' }}>
          <svg width="26" height="26" viewBox="0 0 30 30" aria-hidden="true">
            <circle cx="21" cy="9" r="6" fill="#f97316"/>
            <path d="M17 12 3 26M15 8 2 18M20 15 10 28" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
          </svg>
          COMET
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#problem" style={{ color: '#a8a29e', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 150ms' }}>The Problem</a>
          <a href="#layers" style={{ color: '#a8a29e', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 150ms' }}>Roles</a>
          <a href="#scorecard" style={{ color: '#a8a29e', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 150ms' }}>Scorecard</a>
          <Link to="/sign-in" style={{
            background: '#f97316', color: '#0f0d0c', fontWeight: 700, fontSize: '0.875rem',
            padding: '0.5rem 1.25rem', borderRadius: '8px', textDecoration: 'none',
            transition: 'all 150ms', display: 'inline-block',
          }}>
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  )
}

/* ─── STATS BAR ─── */
function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const stats = [
    { value: '5', unit: 'roles', label: 'Served on one platform' },
    { value: '5', unit: 'languages', label: 'Worker grievance input' },
    { value: '18', unit: 'scorecard items', label: 'PS 26024 requirements' },
    { value: '85', unit: '%', label: 'OCR confidence threshold' },
    { value: '256', unit: 'SHA', label: 'Tamper-evident reports' },
  ]

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current!.querySelectorAll('.stat-item'),
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: ref.current, start: 'top 85%' }
        }
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section style={{ background: '#0a0908', borderTop: '1px solid #2a2420', borderBottom: '1px solid #2a2420', padding: '3rem 0' }}>
      <div ref={ref} style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-item">
            <div style={{ fontFamily: 'ui-monospace,monospace', fontWeight: 700, fontSize: '2.25rem', color: '#f97316', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {s.value}<span style={{ fontSize: '1rem', fontWeight: 600, color: '#f59e0b', marginLeft: '4px' }}>{s.unit}</span>
            </div>
            <div style={{ color: '#a8a29e', fontSize: '0.82rem', marginTop: '0.4rem' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── MAIN LANDING PAGE ─── */
export function LandingPage() {
  const { auth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.session) {
      if (auth.role === 'super_admin' || auth.role === 'corporate_executive') {
        navigate({ to: '/corporate-dashboard', replace: true })
      } else if (auth.role === 'mine_manager') {
        navigate({ to: '/mine-manager', replace: true })
      } else {
        navigate({ to: '/inspection', replace: true })
      }
    }
  }, [auth.session, auth.role, navigate])

  if (auth.session) return null

  return (
    <motion.div
      className="lp-root"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{ minHeight: '100vh' }}
    >
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
        {/* Three.js background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <ThreeHero />
        </div>

        {/* Radial gradient overlay — keeps left text readable, lets right image breathe */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to right, rgba(15,13,12,0.96) 0%, rgba(15,13,12,0.8) 50%, rgba(15,13,12,0.15) 100%)',
        }} />

        {/* Hero content — two-column: text left, dashboard image right */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10, paddingTop: '80px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <motion.div variants={containerVariants}>
            <motion.div variants={itemVariants} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '5px 14px 5px 8px', borderRadius: '9999px',
              background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
              marginBottom: '1.5rem', fontSize: '0.82rem', color: '#f97316', fontWeight: 600,
            }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: '8px', height: '8px' }}>
                <span style={{
                  position: 'absolute', inset: 0, borderRadius: '50%', background: '#f97316',
                  animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                  opacity: 0.75,
                }} className="animate-ping" />
                <span style={{ position: 'relative', width: '8px', height: '8px', borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
              </span>
              SIH 2026 · PS 26024 · Coal India Limited
            </motion.div>

            <motion.h1 variants={itemVariants} style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 1.05,
              letterSpacing: '-0.04em', color: '#f5f0eb', margin: '0 0 1.25rem',
            }}>
              Know what's happening underground{' '}
              <span style={{
                display: 'block',
                background: 'linear-gradient(90deg, #f97316, #f59e0b)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                while it's still happening.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} style={{
              fontSize: '1.15rem', color: '#a8a29e', lineHeight: 1.65, maxWidth: '52ch',
              margin: '0 0 2.25rem',
            }}>
              COMET connects the field inspector, the mine manager, company headquarters and the regulator on one platform. It works <strong style={{ color: '#f5f0eb' }}>offline underground</strong> and goes live the moment there is signal.
            </motion.p>

            <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/sign-in" style={{
                background: '#f97316', color: '#0f0d0c', fontWeight: 700, fontSize: '0.95rem',
                padding: '0.8rem 1.8rem', borderRadius: '10px', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 0 32px rgba(249,115,22,0.3)',
                transition: 'all 150ms',
              }}>
                Start the descent
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
              </Link>
              <a href="#scorecard" style={{
                color: '#f5f0eb', fontWeight: 600, fontSize: '0.95rem',
                padding: '0.8rem 1.8rem', borderRadius: '10px', textDecoration: 'none',
                border: '1px solid #2a2420',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                transition: 'all 150ms',
              }}>
                Jump to scorecard
              </a>
            </motion.div>

            {/* Depth navigation */}
            <motion.ul variants={itemVariants} style={{ listStyle: 'none', margin: '2.5rem 0 0', padding: 0, maxWidth: '380px' }}>
              {[
                { href: '#problem', label: 'Head office and regulator', depth: '0 m' },
                { href: '#layers', label: 'Mine office and safety office', depth: '−120 m' },
                { href: '#layers', label: 'Working face, contractors, workers', depth: '−300 m' },
                { href: '#layers', label: 'The AI layer and how it scales', depth: '−420 m' },
              ].map((l, i) => (
                <li key={i} style={{ borderTop: '1px solid #2a2420' }}>
                  <a href={l.href} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '0.7rem 0.25rem', textDecoration: 'none',
                    color: '#a8a29e', fontWeight: 600, fontSize: '0.9rem',
                    transition: 'color 150ms',
                  }}>
                    <span>{l.label}</span>
                    <span style={{ fontFamily: 'ui-monospace,monospace', color: '#f97316', fontWeight: 700 }}>{l.depth}</span>
                  </a>
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* ── Hero right: dashboard image ── */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {/* Glow behind image */}
            <div style={{
              position: 'absolute', inset: '-20%',
              background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(249,115,22,0.25)',
              boxShadow: '0 0 60px rgba(249,115,22,0.15), 0 32px 64px rgba(0,0,0,0.5)',
            }}>
              {/* Top bar chrome */}
              <div style={{
                background: '#1a1614',
                borderBottom: '1px solid #2a2420',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
              }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ marginLeft: '12px', color: '#a8a29e', fontSize: '0.75rem', fontFamily: 'ui-monospace,monospace' }}>comet — national dashboard</span>
              </div>
              <img
                src="/dashboard_mockup.jpg"
                alt="COMET national dashboard showing mine risk rankings, live alerts and PM10 chart"
                style={{ display: 'block', width: '100%', maxWidth: '580px', objectFit: 'cover' }}
              />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          color: '#a8a29e', zIndex: 10,
          animation: 'bounce 1.5s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Scroll</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <StatsBar />

      {/* ── PROBLEM ── */}
      <div id="problem">
        <ProblemSection />
      </div>

      {/* ── BENTO FEATURES ── */}
      <BentoGrid />

      {/* ── ROLE LAYERS ── */}
      <div id="layers">
        <RoleLayersSection />
      </div>

      {/* ── IMPACT TABLE ── */}
      <ImpactSection />

      {/* ── TECH + ROADMAP ── */}
      <TechSection />

      {/* ── SCORECARD ── */}
      <div id="scorecard">
        <ScorecardSection />
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0a0908', borderTop: '1px solid #2a2420', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 900, fontSize: '1.2rem', color: '#f97316' }}>
            <svg width="22" height="22" viewBox="0 0 30 30" aria-hidden="true">
              <circle cx="21" cy="9" r="6" fill="#f97316"/>
              <path d="M17 12 3 26M15 8 2 18M20 15 10 28" stroke="#f97316" strokeWidth="2" strokeLinecap="round" opacity=".8"/>
            </svg>
            COMET
          </div>
          <p style={{ color: '#a8a29e', fontSize: '0.85rem', margin: 0 }}>
            Coal Operations Monitoring, Enforcement and Transparency. Prototype shown with sample data.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        @media (max-width: 768px) {
          .role-card { grid-template-columns: 1fr !important; }
          .scorecard-list { column-count: 1 !important; }
        }
      `}</style>
    </motion.div>
  )
}
