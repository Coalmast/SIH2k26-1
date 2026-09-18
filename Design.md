---
version: "1.0"
name: COMET Design System
description: >
  COMET (Coal Mine E-Governance & Monitoring Technology) is an AI-enabled governance
  and compliance platform for India's coal mining sector, developed under the Ministry of Coal /
  Coal India Limited initiative. The design system operates across two premium themes:
  "Governance Stone" (light) and "Obsidian Command" (dark). Both modes share the same
  construction-orange accent identity, the same type system, and the same component language.
  The permanent dark sidebar is a signature across both modes — creating a dramatic split
  between the authoritative navigation rail and the content canvas.

themes:
  light: "Governance Stone — warm parchment canvas, dark steel sidebar, burnt-orange authority"
  dark:  "Obsidian Command — near-black warm-tinted canvas, ember-border cards, vivid construction-orange"

colors:
  # ── Light Mode (Governance Stone) ──────────────────────────────────────────
  light:
    background:            "#f2ede8"   # Warm parchment — carved granite feel, never clinical white
    card:                  "#faf7f2"   # Barely-off-white lift above background
    foreground:            "#1a1614"   # Deep warm charcoal — warmer than pure black
    muted:                 "#e8e2da"   # Warm greige — secondary surfaces
    muted-foreground:      "#78716c"   # Stone-gray mid-tone
    border:                "#d4cec5"   # Warm hairline — visible without harshness
    input:                 "#d4cec5"   # Same as border for form inputs
    primary:               "#c2410c"   # Burnt-orange 700 — coal fire authority
    primary-foreground:    "#fff7ed"   # Warm cream on burnt-orange
    secondary:             "#e8e2da"   # Greige — secondary buttons / chips
    secondary-foreground:  "#1a1614"   # Dark on secondary
    accent:                "#fff7ed"   # Orange-50 — hover highlight chips
    accent-foreground:     "#9a3412"   # Orange-800 on light accent
    destructive:           "#dc2626"   # Red-600 — violations / breaches
    ring:                  "#f97316"   # Orange-500 focus ring
    radius:                "0.5rem"    # 8px — slightly softer than default

  # ── Dark Mode (Obsidian Command) ────────────────────────────────────────────
  dark:
    background:            "#0f0d0c"   # Near-black with 1% warm amber tint — never pure black
    card:                  "#171412"   # Warm dark surface — barely above background
    foreground:            "#f5f0eb"   # Warm off-white — not cold #eee
    muted:                 "#1e1a17"   # One step lighter dark for nested surfaces
    muted-foreground:      "#a8a29e"   # Warm gray mid-tone
    border:                "#2a2420"   # Subtle warm dark border
    input:                 "#2a2420"   # Same as border
    primary:               "#f97316"   # Construction orange — vivid, like PPE helmets
    primary-foreground:    "#0f0d0c"   # Near-black text on orange
    secondary:             "#1e1a17"   # Muted dark secondary
    secondary-foreground:  "#f5f0eb"   # Warm white on dark secondary
    accent:                "#1e1a17"   # Same as muted — hover state
    accent-foreground:     "#f5f0eb"   # Warm white on accent
    destructive:           "#ef4444"   # Red-500 — breaches / violations (slightly brighter in dark)
    ring:                  "#f97316"   # Orange-500 focus ring

  # ── Sidebar (PERMANENT DARK — signature across both modes) ──────────────────
  sidebar:
    light:
      background:           "#18181b"   # Zinc-900 — deep steel
      foreground:           "#f4f4f5"   # Zinc-100
      primary:              "#f97316"   # Construction orange — active items
      primary-foreground:   "#18181b"   # Dark on active orange
      accent:               "#27272a"   # Zinc-800 — hover
      accent-foreground:    "#fafafa"   # Near-white on hover
      border:               "#27272a"   # Zinc-800 — subtle inner border
      ring:                 "#f97316"   # Orange focus ring in sidebar
    dark:
      background:           "#0a0908"   # Slightly darker than page canvas — depth illusion
      foreground:           "#f4f4f5"   # Zinc-100
      primary:              "#f97316"   # Same orange — consistent identity
      primary-foreground:   "#0a0908"   # Near-black on orange
      accent:               "#171412"   # Card-level dark for hover
      accent-foreground:    "#fafafa"
      border:               "#1e1a17"   # Muted-level dark border
      ring:                 "#f97316"

  # ── Semantic / Chart Tokens (Shared across both modes) ──────────────────────
  semantic:
    comet-up:      "#16a34a"   # Green-600 — Compliant / Approved / Positive trend
    comet-down:    "#dc2626"   # Red-600 — Breached / Violation / Negative trend
    comet-pending: "#f59e0b"   # Amber-400 — Pending / In Progress / Warning
    comet-orange:  "#f97316"   # Orange-500 — Primary brand / Construction orange
    chart-1:       "#f97316"   # Primary series — Orange
    chart-2:       "#16a34a"   # Compliant series — Green
    chart-3:       "#dc2626"   # Breach series — Red
    chart-4:       "#f59e0b"   # Pending series — Amber
    chart-5:       "#a8a29e"   # Neutral series — Stone gray

typography:
  # ── Font Stack ────────────────────────────────────────────────────────────────
  primary:    "Geist, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  monospace:  "Geist Mono, 'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace"

  # Geist is Vercel's typeface — modern, geometric, highly legible at small sizes.
  # Geist Mono provides perfectly paired tabular number rendering for IDs, codes, and data.
  # Fallback: Inter remains strong if Geist fails to load.

  # ── Type Scale ────────────────────────────────────────────────────────────────
  roles:
    hero:           { size: "2.5rem",  weight: 700, tracking: "-0.04em", lineHeight: 1.1 }
    display-lg:     { size: "2rem",    weight: 700, tracking: "-0.03em", lineHeight: 1.15 }
    display-md:     { size: "1.5rem",  weight: 600, tracking: "-0.02em", lineHeight: 1.2 }
    title-lg:       { size: "1.25rem", weight: 600, tracking: "-0.01em", lineHeight: 1.3 }
    title-md:       { size: "1rem",    weight: 600, tracking: "0",       lineHeight: 1.4 }
    title-sm:       { size: "0.875rem",weight: 600, tracking: "0",       lineHeight: 1.4 }
    body-md:        { size: "0.875rem",weight: 400, tracking: "0",       lineHeight: 1.6 }
    body-sm:        { size: "0.8125rem",weight: 400,tracking: "0",       lineHeight: 1.6 }
    caption:        { size: "0.75rem", weight: 500, tracking: "0.01em",  lineHeight: 1.4 }
    label:          { size: "0.75rem", weight: 600, tracking: "0.05em",  lineHeight: 1, textTransform: "uppercase" }
    button:         { size: "0.875rem",weight: 600, tracking: "0",       lineHeight: 1 }
    numeric-lg:     { size: "1.5rem",  weight: 700, tracking: "-0.02em", lineHeight: 1.1, fontFamily: "monospace" }
    numeric-md:     { size: "1rem",    weight: 600, tracking: "0",       lineHeight: 1.4, fontFamily: "monospace" }
    numeric-sm:     { size: "0.875rem",weight: 500, tracking: "0",       lineHeight: 1.4, fontFamily: "monospace" }
    code:           { size: "0.8125rem",weight: 400,tracking: "0",       lineHeight: 1.6, fontFamily: "monospace" }

spacing:
  unit: 4px
  scale:
    xxs: "0.25rem"   # 4px
    xs:  "0.5rem"    # 8px
    sm:  "0.75rem"   # 12px
    md:  "1rem"      # 16px
    lg:  "1.5rem"    # 24px
    xl:  "2rem"      # 32px
    xxl: "3rem"      # 48px
    section: "5rem"  # 80px

rounded:
  xs:   "0.125rem"  # 2px
  sm:   "0.25rem"   # 4px
  md:   "0.5rem"    # 8px — default (matches --radius)
  lg:   "0.75rem"   # 12px
  xl:   "1rem"      # 16px
  "2xl":"1.5rem"    # 24px
  pill: "9999px"
  full: "9999px"

elevation:
  levels:
    flat:     { shadow: "none",                                      use: "page sections, headers, hero bands" }
    card:     { shadow: "0 1px 2px rgb(0 0 0 / 0.04)",              use: "cards on light mode" }
    raised:   { shadow: "0 2px 8px rgb(0 0 0 / 0.08)",              use: "modals, dropdowns, popovers" }
    floating: { shadow: "0 8px 32px rgb(0 0 0 / 0.12)",             use: "command menu, tooltips" }
    glow-orange: { shadow: "0 0 20px rgb(249 115 22 / 0.25)",       use: "active kanban cards, primary CTAs on dark" }
    glow-red:    { shadow: "0 0 16px rgb(220 38 38 / 0.20)",        use: "breach alerts, critical violations" }

animations:
  # ── Durations ─────────────────────────────────────────────────────────────────
  fast:     "150ms"   # Micro-interactions (hover states, button presses)
  default:  "250ms"   # Standard transitions (tab changes, color shifts)
  slow:     "400ms"   # Page transitions, panel slides
  very-slow:"600ms"   # Count-up animations, loaders

  # ── Easings ───────────────────────────────────────────────────────────────────
  ease-spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"   # Slightly overshoots — premium feel
  ease-out:    "cubic-bezier(0.16, 1, 0.3, 1)"        # Snappy deceleration
  ease-in-out: "cubic-bezier(0.45, 0, 0.55, 1)"       # Balanced — for color transitions

  # ── Micro-Interaction Library ─────────────────────────────────────────────────
  interactions:
    stat-count-up:
      description: "Dashboard stat numbers animate from 0 to their value on page mount"
      implementation: "framer-motion useSpring + NumberTicker component"
      duration: "600ms"
      easing: "ease-out"

    card-hover-glow:
      description: "Cards emit a faint orange/amber border glow on hover using BorderBeam"
      implementation: "border-beam component triggered on group-hover"
      duration: "300ms"
      note: "Color is severity-aware: amber=pending, red=breached, green=compliant"

    sidebar-active-slide:
      description: "Active navigation item indicator slides between items"
      implementation: "framer-motion layoutId on the sidebar active pill"
      duration: "200ms"
      easing: "ease-spring"

    page-transition:
      description: "Route changes trigger a subtle blur + scale crossfade"
      implementation: "framer-motion AnimatePresence on route outlet"
      keyframes: "opacity 0→1, filter blur(4px)→none, scale 0.98→1"
      duration: "250ms"

    status-badge-pulse:
      description: "Breached/critical items have a slow pulsing red ring"
      implementation: "pulsating-button animation CSS or framer-motion"
      period: "2000ms"
      note: "Only applies to status=breached. Active inspections get green breathe."

    skeleton-shimmer:
      description: "Loading skeletons shimmer left-to-right before data arrives"
      implementation: "Skeleton component with shimmer keyframe"
      duration: "1500ms"
      loop: true

    kanban-drag-elevation:
      description: "Dragged Kanban card gets orange glow shadow + 4° tilt"
      implementation: "framer-motion whileDrag with rotate and boxShadow"
      rotate: "4deg"
      shadow: "{elevation.glow-orange}"

    number-change-flash:
      description: "Stat numbers flash amber briefly when their value changes"
      implementation: "CSS color transition on value change via useEffect"
      duration: "300ms"
      color: "{colors.semantic.comet-pending}"

    toast-slide-blur:
      description: "Sonner toasts slide from right with backdrop-blur background"
      implementation: "Sonner theme override"
      background-light: "rgba(242, 237, 232, 0.85) + backdrop-blur-lg"
      background-dark:  "rgba(23, 20, 18, 0.85) + backdrop-blur-lg"

    command-menu-bloom:
      description: "Cmd+K command palette blooms open with scale + backdrop blur"
      implementation: "cmdk + framer-motion scale(0.96)→1 + blur"
      background: "glassmorphic with 12px blur"

    calendar-event-expand:
      description: "Calendar event cards expand into a rich preview tooltip on hover"
      implementation: "framer-motion height animation on EventCard hover"
      duration: "200ms"

    sidebar-logo-beam:
      description: "COMET logo in sidebar has a border-beam sweep on app load"
      implementation: "border-beam component on the logo container"
      trigger: "once on mount"
      duration: "1200ms"

components:
  button-primary:
    light: { bg: "{colors.light.primary}", text: "{colors.light.primary-foreground}", radius: "{rounded.md}" }
    dark:  { bg: "{colors.dark.primary}",  text: "{colors.dark.primary-foreground}",  radius: "{rounded.md}" }
    hover: "brightness(110%)"
    active: "brightness(90%)"
    animation: "scale(0.98) on press — 150ms spring"

  button-secondary:
    light: { bg: "{colors.light.secondary}", text: "{colors.light.secondary-foreground}", border: "{colors.light.border}" }
    dark:  { bg: "{colors.dark.secondary}",  text: "{colors.dark.secondary-foreground}",  border: "{colors.dark.border}" }

  button-ghost:
    light: { bg: "transparent", text: "{colors.light.foreground}" }
    dark:  { bg: "transparent", text: "{colors.dark.foreground}" }
    hover-light: "bg: {colors.light.accent}"
    hover-dark:  "bg: {colors.dark.accent}"

  button-destructive:
    light: { bg: "{colors.light.destructive}", text: "#ffffff" }
    dark:  { bg: "{colors.dark.destructive}",  text: "#ffffff" }

  card:
    light: { bg: "{colors.light.card}", border: "{colors.light.border}", shadow: "{elevation.card}", radius: "{rounded.lg}" }
    dark:  { bg: "{colors.dark.card}",  border: "{colors.dark.border}",  shadow: "none",           radius: "{rounded.lg}" }
    hover-animation: "border-beam sweep + translateY(-1px)"
    dark-border-hover: "1px solid rgba(249 115 22 / 0.3)"

  badge-compliant:
    bg-light: "rgba(22 163 74 / 0.1)"
    text-light: "#15803d"
    bg-dark:  "rgba(22 163 74 / 0.15)"
    text-dark: "#4ade80"

  badge-breached:
    bg-light: "rgba(220 38 38 / 0.1)"
    text-light: "#b91c1c"
    bg-dark:  "rgba(220 38 38 / 0.15)"
    text-dark: "#f87171"
    animation: "{animations.interactions.status-badge-pulse}"

  badge-pending:
    bg-light: "rgba(245 158 11 / 0.1)"
    text-light: "#b45309"
    bg-dark:  "rgba(245 158 11 / 0.15)"
    text-dark: "#fbbf24"

  stat-card:
    description: "Dashboard KPI cards with animated count-up values"
    animation: "{animations.interactions.stat-count-up}"
    value-font: "{typography.roles.numeric-lg}"
    label-font: "{typography.roles.label}"

  kanban-card:
    radius: "{rounded.lg}"
    drag-animation: "{animations.interactions.kanban-drag-elevation}"
    hover-animation: "scale(1.02) rotate(-1deg) — spring"

  sidebar-nav-item:
    active-animation: "{animations.interactions.sidebar-active-slide}"
    hover: "bg-sidebar-accent transition-colors 150ms"

  compliance-status-indicator:
    dot-size: "8px"
    animation: "{animations.interactions.status-badge-pulse}"
    compliant: "{colors.semantic.comet-up}"
    breached: "{colors.semantic.comet-down}"
    pending: "{colors.semantic.comet-pending}"

rules:
  1: "The sidebar is ALWAYS dark (#18181b in light, #0a0908 in dark). Never flip it white. The dark sidebar is a COMET design signature."
  2: "Orange is the ONLY brand accent. Never introduce blue, purple, or teal as primary actions."
  3: "Never use pure white (#ffffff) as a light-mode background. The background is always warm parchment (#f2ede8). Cards may be #faf7f2."
  4: "Never use pure black (#000000) as dark-mode background. Always use the warm-tinted near-black (#0f0d0c)."
  5: "Semantic colors are non-negotiable: green=compliant/up, red=breached/down, amber=pending. Never repurpose them."
  6: "Numeric values (IDs, attendance counts, compliance scores) always render in Geist Mono."
  7: "All interactive elements must have a visible hover AND an active/pressed state. 150ms transitions minimum."
  8: "Critical violations (breached status) must show the pulsing ring animation. Never static for critical states."
  9: "Page transitions must always use the blur-crossfade. Route changes must never feel abrupt."
  10: "Card hover should never rely on background-color alone. Use border-beam, translateY, or glow-shadow to signal interactivity."

known-gaps:
  - "Geist font integration requires CDN import or package install — add to main.tsx"
  - "Border-beam animations on every card would be performance-heavy; trigger on hover only, not on mount"
  - "Dark sidebar in light mode requires sidebar tokens to be decoupled from the page theme — already done in theme.css"
  - "Command menu (Cmd+K) glassmorphic theme requires custom cmdk styling"
  - "Calendar event hover-expand animation requires modification to the event-calendar component"
---

# COMET Design System

> **"Authoritative Intelligence"** — A governance platform for India's coal mining sector.
> This design system serves Mine Managers, Safety Inspectors, Corporate Officials, and Regulatory
> Authorities (DGMS, Ministry of Coal). It must feel trustworthy, precise, and premium — the
> digital equivalent of a well-run control room.

---

## 🎨 Themes

COMET ships two premium themes that share a unified component language and orange identity.

### 🏛️ Governance Stone *(Light Mode)*

The light theme evokes **carved granite and official documentation** — warm, authoritative, substantial. The canvas is never clinical white; it is the color of aged parchment, as if the compliance records themselves are embedded in the surface. The dark steel sidebar creates a dramatic split — you always know you're in a serious platform.

**Core Atmosphere:**
- Canvas: `#f2ede8` — warm parchment stone
- Cards: `#faf7f2` — barely lifted off-white
- Sidebar: `#18181b` — permanent deep steel (never flips light)
- Primary Accent: `#c2410c` — burnt coal-fire orange

### ⚡ Obsidian Command *(Dark Mode)*

The dark theme evokes **a coal mine control room at night** — deep warmth, amber glow monitors, precise data readouts on dark displays. The background is not cold gray or pure black; it has a 1% warm amber tint that makes it feel alive rather than dead. Cards have subtle ember-colored borders that glow when hovered.

**Core Atmosphere:**
- Canvas: `#0f0d0c` — warm-tinted near-black
- Cards: `#171412` — barely above canvas
- Sidebar: `#0a0908` — deeper than canvas (creates Z-depth)
- Primary Accent: `#f97316` — vivid construction orange (PPE helmet orange)

---

## 🎨 Color Palette

### Light Mode (Governance Stone)

| Token | Value | Usage |
|---|---|---|
| `background` | `#f2ede8` | Page canvas — warm parchment, never white |
| `card` | `#faf7f2` | Elevated card surfaces |
| `foreground` | `#1a1614` | Primary text — warm deep charcoal |
| `muted` | `#e8e2da` | Disabled states, secondary surfaces |
| `muted-foreground` | `#78716c` | Secondary text, placeholders |
| `border` | `#d4cec5` | Hairlines, input borders |
| `primary` | `#c2410c` | Burnt-orange — CTAs, active states, links |
| `primary-foreground` | `#fff7ed` | Text on primary (warm cream) |
| `secondary` | `#e8e2da` | Secondary buttons, chips |
| `accent` | `#fff7ed` | Orange-50 hover highlights |
| `destructive` | `#dc2626` | Violations, breaches, errors |
| `ring` | `#f97316` | Focus ring — orange-500 |

### Dark Mode (Obsidian Command)

| Token | Value | Usage |
|---|---|---|
| `background` | `#0f0d0c` | Page canvas — warm near-black |
| `card` | `#171412` | Elevated card surfaces |
| `foreground` | `#f5f0eb` | Primary text — warm off-white |
| `muted` | `#1e1a17` | Secondary surfaces, nested panels |
| `muted-foreground` | `#a8a29e` | Secondary text, placeholders |
| `border` | `#2a2420` | Subtle warm dark hairlines |
| `primary` | `#f97316` | Construction orange — vivid, energetic |
| `primary-foreground` | `#0f0d0c` | Dark text on orange |
| `destructive` | `#ef4444` | Violations, breaches (brighter in dark) |
| `ring` | `#f97316` | Focus ring — orange-500 |

### Sidebar (Permanent Dark — Design Signature)

The sidebar is **always dark** regardless of the page theme. This is COMET's most distinctive visual trait.

| Mode | Background | Foreground | Active Item |
|---|---|---|---|
| Light (Governance Stone) | `#18181b` Zinc-900 | `#f4f4f5` | `#f97316` Orange |
| Dark (Obsidian Command) | `#0a0908` Deeper dark | `#f4f4f5` | `#f97316` Orange |

### Semantic Color System

| Token | Color | Meaning | Usage |
|---|---|---|---|
| `comet-up` | `#16a34a` Green-600 | Compliant / Approved / Positive | Approval badges, trend-up arrows |
| `comet-down` | `#dc2626` Red-600 | Breached / Violation / Negative | Breach alerts, violation counts |
| `comet-pending` | `#f59e0b` Amber-400 | Pending / In Progress / Warning | Open tasks, review states |
| `comet-orange` | `#f97316` Orange-500 | Brand / Primary CTA | Navigation accents, buttons |

> **Rule:** These semantic colors are never repurposed. Green is not "success" for a generic form — it means "compliant" in this system.

---

## ✍️ Typography

### Font Stack

| Font | Role | Rationale |
|---|---|---|
| **Geist** | UI text, body, buttons, labels | Vercel's geometric typeface — modern, highly legible at small sizes, designed for dense data UIs |
| **Geist Mono** | Numbers, IDs, codes, compliance scores | Paired monospace — tabular number rendering, gives data a "technical readout" character |
| Fallback | Inter → system-ui | Strong fallback chain |

### Type Scale

| Role | Size | Weight | Use |
|---|---|---|---|
| `hero` | 2.5rem / 700 | Display headlines on dashboards |
| `display-lg` | 2rem / 700 | Page-level section titles |
| `display-md` | 1.5rem / 600 | Module headings |
| `title-lg` | 1.25rem / 600 | Card titles, panel headers |
| `title-md` | 1rem / 600 | Sub-section headings |
| `title-sm` | 0.875rem / 600 | Badge labels, column headers |
| `body-md` | 0.875rem / 400 | Default running text |
| `body-sm` | 0.8125rem / 400 | Secondary descriptions, help text |
| `caption` | 0.75rem / 500 | Timestamps, metadata |
| `label` | 0.75rem / 600 UPPERCASE | Section labels, table headers |
| `button` | 0.875rem / 600 | All button labels |
| `numeric-lg` | 1.5rem / 700 Mono | KPI values, large stat numbers |
| `numeric-md` | 1rem / 600 Mono | Table data values, scores |
| `numeric-sm` | 0.875rem / 500 Mono | Inline counts, percentages |

---

## ✨ Animation & Micro-Interaction System

Every interaction must feel **precise and intentional** — like a well-engineered instrument, not a flashy toy.

### Duration Scale

| Name | Duration | Use |
|---|---|---|
| Fast | 150ms | Hover states, button presses, color transitions |
| Default | 250ms | Tab changes, view switches, expand/collapse |
| Slow | 400ms | Panel slides, sidebar open/close |
| Very Slow | 600ms | Count-up animations, complex page transitions |

### Easing

| Name | Curve | Use |
|---|---|---|
| Spring | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Sidebar items, active indicators — slight overshoot |
| Out | `cubic-bezier(0.16, 1, 0.3, 1)` | Page transitions, panel reveals — snappy deceleration |
| In-Out | `cubic-bezier(0.45, 0, 0.55, 1)` | Color transitions, opacity changes |

### Micro-Interaction Catalogue

#### 1. Stat Count-Up
Dashboard KPI numbers animate from 0 to their real value on mount using `framer-motion` springs. Compliance scores, violation counts, pending tasks — all count up. Creates an immediate sense of "live data."

#### 2. Card Hover — Border Beam + Lift
On card hover: a `BorderBeam` sweeps around the card perimeter, the card rises `1px` (translateY), and a faint orange glow appears below. Color is severity-aware — orange for normal, red for breached cards.

#### 3. Sidebar Active Slide
The active navigation indicator uses `framer-motion layoutId` to slide smoothly between items when navigating. The pill never jumps — it glides.

#### 4. Page Transition — Blur Crossfade
Every route change: the outgoing page dissolves with `opacity 0, blur(4px), scale(0.99)` and the new page blooms in. 250ms. The user always knows the system responded.

#### 5. Status Badge Pulse
`breached` status items have a slow breathing ring animation — a red pulse that contracts and expands every 2 seconds. You cannot miss a critical violation.

#### 6. Kanban Card Drag Elevation
Picked-up Kanban cards receive an orange `box-shadow` glow, scale to `1.04`, and tilt `4°`. They feel physically lifted off the board.

#### 7. Number Flash on Change
When a stat value changes (real-time update), it flashes amber (`#f59e0b`) briefly before settling to its normal color. Like a Bloomberg terminal price tick.

#### 8. Toast — Glassmorphic Slide
Notifications slide from the right with a `backdrop-blur` glass background matching the current theme. Orange left border for information, red for critical alerts.

#### 9. Command Palette Bloom
`Cmd+K` opens a command menu with `scale(0.96)→1` spring + backdrop blur bloom. Glassmorphic background — the rest of the UI dims to 40% opacity.

#### 10. Calendar Event Hover Expand
Compliance calendar events expand into a rich preview card on hover — showing title, due date, assigned officer, and status — using a `framer-motion` height animation.

#### 11. COMET Logo Beam
On app load, the COMET wordmark in the sidebar plays a `BorderBeam` sweep once. Establishes the system has loaded and is ready.

#### 12. Skeleton Shimmer
Data loading states use exact-shape shimmer skeletons — not generic spinners. The skeleton perfectly matches the card it will become.

---

## 🧩 Component Guidelines

### Cards
- Light: `bg-card` + `border` + subtle `box-shadow`
- Dark: `bg-card` + `border` (no shadow — depth comes from background contrast)
- Hover: Border beam sweep + 1px lift + faint glow
- **Never** use rounded corners less than `rounded-lg` (12px) for content cards

### Buttons
- Primary: Orange fill, cream text. Scale 0.98 on press (spring, 150ms)
- Secondary: Warm gray fill, dark text. Hairline border.
- Ghost: Transparent, text-colored. Accent background on hover.
- Destructive: Red fill, white text. Only for permanent actions.

### Status Indicators
- Always use both color AND shape (icon) — never rely on color alone
- `✓` Compliant — Green dot + text
- `⚠` Pending — Amber dot + pulsing ring + text
- `✗` Breached — Red dot + breathing pulse animation + text

### Data Tables
- Header: `label` typography (uppercase, 0.75rem, tracked)
- Values: Geist Mono for numbers, Geist for text
- Row hover: `bg-muted/50` transition — 150ms
- Alternating rows: Never. Use borders instead.

### Forms & Inputs
- Height: 40px standard
- Border: 1px `--border` by default, `--ring` on focus with 2px offset ring
- Label: Always above the input, `caption` typography
- Error states: Red border + icon + message below (never tooltip-only)

---

## 📐 Layout

### Spacing Philosophy
Dense but breathable — this is a data-heavy governance platform, not a marketing page. Internal card padding: `1rem` (16px) for compact, `1.5rem` (24px) for standard. Page section gaps: `1.5rem`–`2rem`.

### Grid
- **Sidebar:** 240px fixed (collapsible to 48px icon-rail)
- **Right Sidebar (Analytics):** 320px collapsible (off by default)
- **Content area:** Fluid fill between sidebars
- **Max content width:** None — fluid to viewport (use `fluid` prop on `<Main>`)

### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | Sidebar collapses to bottom nav; single column |
| Tablet | 768–1024px | Sidebar icon-rail; 2-column grid |
| Desktop | 1024–1440px | Full sidebar; multi-column layouts |
| Wide | > 1440px | Same as desktop with more content breathing room |

---

## ✅ Do's & Don'ts

### Do
- Use orange for every primary action, active state, and brand moment
- Keep the sidebar permanently dark — it is a COMET signature
- Animate every meaningful data change (count-up, flash, pulse)
- Use warm-tinted backgrounds — never pure white or pure black
- Show skeleton loaders that match the card shape exactly
- Use `Geist Mono` for all numerical compliance data

### Don't
- Don't introduce blue, purple, or teal as primary or secondary brand colors
- Don't use pure `#ffffff` or `#000000` for any surface
- Don't show critical violations without the pulsing animation
- Don't use generic spinners — always use exact-shape skeletons
- Don't mix semantic colors — green is compliance only, red is violation only
- Don't use color alone for status — always pair with an icon
- Don't use rounded corners less than `rounded-lg` on content cards
- Don't make route changes feel abrupt — always use the blur crossfade
