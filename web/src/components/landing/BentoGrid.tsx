import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ─── Icons ─── */
const IconDashboard = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const IconAI = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
  </svg>
)
const IconPhone = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2"/>
  </svg>
)
const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IconMic = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
)
const IconScroll = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IconOCR = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"/>
    <line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
)
const IconAlert = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const IconMap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
)

/* ─── Arrow icon ─── */
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
)

/* ─── Features structured for the interlocking grid ─── */
const features = [
  // ROW 1-2 (Tall and Large cards)
  {
    id: 'offline-app',
    icon: <IconPhone />,
    title: 'Offline-First Field App',
    description: 'React Native + Expo. Underground has no signal — the app doesn\'t need one. Records sync the moment the phone finds signal.',
    tag: 'Working Face',
    gridClass: 'bento-col-1 bento-row-2 tablet-span-2',
    image: '/mobile_field_app.jpg',
    layout: 'tall' // Image at bottom
  },
  {
    id: 'dashboard',
    icon: <IconDashboard />,
    title: 'National Dashboard',
    description: 'One live view across every mine and subsidiary — inspections done vs planned, violations by severity, corrective actions backlog, and environmental readings.',
    tag: 'Head Office',
    gridClass: 'bento-col-2 bento-row-2 tablet-span-2',
    image: '/dashboard_mockup.jpg',
    layout: 'center' // Massive center piece
  },
  {
    id: 'ai-risk',
    icon: <IconAI />,
    title: 'AI Risk Intelligence',
    description: 'Gemini + ADK score every mine from violation history, closure rates, gas readings and production pressure. Full reasoning shown.',
    tag: 'AI Layer',
    gridClass: 'bento-col-1 bento-row-2 tablet-span-2',
    image: '/ai_risk_chart.jpg',
    layout: 'tall' // Image at bottom
  },
  // ROW 3
  {
    id: 'multilingual',
    icon: <IconMic />,
    title: 'Multilingual Grievance',
    description: 'Any worker records a grievance by voice or text in 5 languages. COMET transcribes and routes it.',
    tag: 'Working Face',
    gridClass: 'bento-col-2 bento-row-1 tablet-span-2',
    image: null,
    layout: 'square'
  },
  {
    id: 'escalation',
    icon: <IconAlert />,
    title: 'Escalation Ladder',
    description: 'Deadlines chase themselves. Overdue tasks auto-escalate from officer to DGMS.',
    tag: 'Mine Office',
    gridClass: 'bento-col-1 bento-row-1',
    image: null,
    layout: 'square'
  },
  {
    id: 'tamper',
    icon: <IconShield />,
    title: 'Tamper-Evident Reports',
    description: 'Every statutory report carries a SHA-256 fingerprint at signing.',
    tag: 'Regulator',
    gridClass: 'bento-col-1 bento-row-1',
    image: null,
    layout: 'square'
  },
  // ROW 4
  {
    id: 'ocr',
    icon: <IconOCR />,
    title: 'OCR Digitisation',
    description: 'Scans contractor licences automatically. Flags low confidence to humans.',
    tag: 'Working Face',
    gridClass: 'bento-col-1 bento-row-1',
    image: null,
    layout: 'square'
  },
  {
    id: 'gis',
    icon: <IconMap />,
    title: 'GIS Mine Map',
    description: 'MapLibre + PostGIS. Sensor readings appear on the map dynamically.',
    tag: 'Mine Office',
    gridClass: 'bento-col-1 bento-row-1',
    image: null,
    layout: 'square'
  },
  {
    id: 'statutory',
    icon: <IconScroll />,
    title: 'Automated Statutory Reports',
    description: 'Fills DGMS and SPCB reports from real data. A person reviews and signs digitally.',
    tag: 'Mine Office',
    gridClass: 'bento-col-2 bento-row-1 tablet-span-2',
    image: null,
    layout: 'square'
  },
]

export function BentoGrid() {
  const gridRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%' }
        }
      )
      if (gridRef.current) {
        gsap.fromTo(gridRef.current.querySelectorAll('.bento-card'),
          { y: 40, opacity: 0, scale: 0.98 },
          {
            y: 0, opacity: 1, scale: 1, stagger: 0.06, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 80%' }
          }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  return (
    <section style={{ background: '#0a0908', padding: '6rem 0 7rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Heading */}
        <div ref={headingRef} style={{ marginBottom: '3.5rem' }}>
          <div className="depth-label">Platform Capabilities</div>
          <h2 className="lp-h2">
            Everything you need.<br />
            <span style={{ color: '#f97316' }}>Everywhere you need it.</span>
          </h2>
          <p style={{ color: '#a8a29e', fontSize: '1.1rem', maxWidth: '56ch', lineHeight: 1.6, marginTop: '0.75rem' }}>
            From the working face at −300 m to the regulatory head office at the surface — every layer connected, every record verified.
          </p>
        </div>

        {/* Bento Grid */}
        <div
          ref={gridRef}
          className="bento-responsive-grid"
        >
          {features.map((f, idx) => (
            <div
              key={f.id}
              className={`bento-card ${f.gridClass}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: f.layout === 'center' ? '0' : '1.75rem',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
                background: 'linear-gradient(to right, transparent, rgba(249,115,22,0.4), transparent)'
              }} />

              {f.layout === 'center' ? (
                /* Center large card (National Dashboard) */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ padding: '2.5rem 2.5rem 0', flex: 1, position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {f.icon}
                      </div>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: '#f97316', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                        borderRadius: '4px', padding: '4px 10px',
                      }}>{f.tag}</span>
                    </div>
                    <h3 style={{ color: '#f5f0eb', fontWeight: 700, fontSize: '1.75rem', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                      {f.title}
                    </h3>
                    <p style={{ color: '#a8a29e', fontSize: '1.05rem', lineHeight: 1.6, margin: 0, maxWidth: '42ch' }}>
                      {f.description}
                    </p>
                  </div>
                  <div style={{ position: 'relative', marginTop: '2rem', flex: 2, minHeight: '300px' }}>
                    {/* Gradient fade to blend image into card at top */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '80px',
                      background: 'linear-gradient(to bottom, #171412, transparent)',
                      zIndex: 2, pointerEvents: 'none'
                    }} />
                    <img
                      src={f.image!}
                      alt={f.title}
                      style={{
                        position: 'absolute', top: 0, left: '5%', width: '90%', height: '110%',
                        objectFit: 'cover', objectPosition: 'top',
                        borderRadius: '16px 16px 0 0',
                        border: '1px solid rgba(42,36,32,0.8)',
                        borderBottom: 'none',
                        boxShadow: '0 -20px 40px rgba(0,0,0,0.4)',
                        filter: 'brightness(0.9)',
                        transition: 'filter 300ms ease, transform 400ms ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.filter = 'brightness(1.05)'
                        e.currentTarget.style.transform = 'translateY(-5px)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.filter = 'brightness(0.9)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    />
                  </div>
                </div>
              ) : f.layout === 'tall' ? (
                /* Tall cards (App, AI Risk) */
                <>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {f.icon}
                      </div>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: '#f97316', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                        borderRadius: '4px', padding: '3px 6px',
                      }}>{f.tag}</span>
                    </div>
                    <h3 style={{ color: '#f5f0eb', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.65rem', letterSpacing: '-0.01em' }}>
                      {f.title}
                    </h3>
                    <p style={{ color: '#a8a29e', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                      {f.description}
                    </p>
                  </div>
                  <div style={{
                    marginTop: '1.5rem',
                    flex: 1,
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #2a2420',
                    minHeight: '180px',
                  }}>
                    <img
                      src={f.image!}
                      alt={f.title}
                      style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.8)',
                        transition: 'filter 300ms ease, transform 400ms ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.filter = 'brightness(1)'
                        e.currentTarget.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.filter = 'brightness(0.8)'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    />
                  </div>
                </>
              ) : (
                /* Square / Wide without image */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {f.icon}
                      </div>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                        color: '#f97316', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
                        borderRadius: '4px', padding: '3px 6px',
                      }}>{f.tag}</span>
                    </div>
                    <h3 style={{ color: '#f5f0eb', fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.65rem', letterSpacing: '-0.01em' }}>
                      {f.title}
                    </h3>
                    <p style={{ color: '#a8a29e', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                      {f.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      border: '1px solid rgba(249,115,22,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316',
                    }}>
                      <ArrowRight />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
