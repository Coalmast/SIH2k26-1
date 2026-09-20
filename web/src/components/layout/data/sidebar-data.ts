import {
  LayoutDashboard,
  ShieldAlert,
  Search,
  Users,
  Leaf,
  Activity,
  AlertTriangle,
  FileScan,
  Map,
  Bell,
  MessageSquare,
  BrainCircuit,
  FileSignature,
  Settings,
  HardHat,
  Briefcase,
  CalendarCheck
} from 'lucide-react'
import { type SidebarData, type NavGroup } from '../types'
import { type AppRole } from '@/stores/auth-store'

// Base data
const user = {
  name: 'Mine Official',
  email: 'official@coalmines.gov.in',
  avatar: '/avatars/shadcn.jpg',
}

const teams = [
  {
    name: 'Coal India Limited',
    logo: HardHat,
    plan: 'Active',
  }
]

// --- ROLE SPECIFIC NAVIGATION GROUPS ---

const mineManagerNav: NavGroup[] = [
  {
    title: '⚡ COMMAND CENTER',
    items: [
      { title: 'Mine Dashboard', url: '/mine-manager', icon: LayoutDashboard },
      { title: 'Live Alerts', url: '/alerts', icon: Bell, badge: 'unread' }, // special tag for badge
      { title: 'Environment', url: '/environment', icon: Leaf },
      { title: 'GIS Risk Map', url: '/mine-map', icon: Map },
    ],
  },
  {
    title: '📋 COMPLIANCE & SAFETY',
    items: [
      { title: 'Compliance Tasks', url: '/compliance', icon: ShieldAlert },
      { title: 'Inspections', url: '/inspection', icon: Search },
      { title: 'Incidents', url: '/incidents', icon: AlertTriangle },
    ],
  },
  {
    title: '🏭 OPERATIONS',
    items: [
      { title: 'Production', url: '/production', icon: Activity },
    ],
  },
  {
    title: '🤝 CONTRACTORS',
    items: [
      { title: 'Contractor Management', url: '/contractors', icon: Users },
      { title: 'Attendance Management', url: '/attendance', icon: CalendarCheck },
    ],
  },
  {
    title: '📁 REPORTS & DOCS',
    items: [
      { title: 'Statutory Reports', url: '/reports', icon: FileSignature },
      { title: 'Grievances', url: '/grievances', icon: MessageSquare },
      { title: 'OCR / Digitization', url: '/ocr', icon: FileScan },
    ],
  },
  {
    title: '🤖 AI INSIGHTS',
    items: [
      { title: 'AI Analytics', url: '/ai-analytics', icon: BrainCircuit },
    ],
  },
]

const corporateExecutiveNav: NavGroup[] = [
  {
    title: '🏢 OVERVIEW',
    items: [
      { title: 'National Dashboard', url: '/corporate-dashboard', icon: LayoutDashboard },
      { title: 'Live Alerts', url: '/alerts', icon: Bell, badge: 'unread' },
    ],
  },
  {
    title: '📊 PERFORMANCE',
    items: [
      { title: 'Compliance Overview', url: '/compliance', icon: ShieldAlert },
      { title: 'Production Analytics', url: '/production', icon: Activity },
      { title: 'AI Risk Intelligence', url: '/ai-analytics', icon: BrainCircuit },
    ],
  },
  {
    title: '🌿 SUSTAINABILITY',
    items: [
      { title: 'Environmental Summary', url: '/environment', icon: Leaf },
    ],
  },
  {
    title: '🤝 CONTRACTOR RISK',
    items: [
      { title: 'Contractor Trust Map', url: '/contractors', icon: Users },
    ],
  },
  {
    title: '📋 REPORTING',
    items: [
      { title: 'Statutory Reports', url: '/reports', icon: FileSignature },
      { title: 'Regulator Portal', url: '/regulator', icon: ShieldAlert },
      { title: 'OCR / Digitization', url: '/ocr', icon: FileScan },
    ],
  },
]

const fieldInspectorNav: NavGroup[] = [
  {
    title: "📍 TODAY'S WORK",
    items: [
      { title: 'Start Inspection', url: '/inspection', icon: Search },
      { title: 'Compliance Tasks', url: '/compliance', icon: ShieldAlert },
      { title: 'Report Incident', url: '/incidents', icon: AlertTriangle },
    ],
  },
  {
    title: '🗺️ FIELD TOOLS',
    items: [
      { title: 'Mine Map', url: '/mine-map', icon: Map },
      { title: 'Alerts', url: '/alerts', icon: Bell, badge: 'unread' },
    ],
  },
]

const safetyOfficialNav: NavGroup[] = [
  {
    title: '🛡️ SAFETY DESK',
    items: [
      { title: 'Alerts', url: '/alerts', icon: Bell, badge: 'unread' },
      { title: 'Compliance Dashboard', url: '/compliance', icon: ShieldAlert },
      { title: 'Inspections', url: '/inspection', icon: Search },
      { title: 'Incidents', url: '/incidents', icon: AlertTriangle },
    ],
  },
  {
    title: '🌍 ENVIRONMENTAL',
    items: [
      { title: 'Environment', url: '/environment', icon: Leaf },
      { title: 'GIS Map', url: '/mine-map', icon: Map },
    ],
  },
  {
    title: '📁 REPORTS',
    items: [
      { title: 'Statutory Reports', url: '/reports', icon: FileSignature },
    ],
  },
]

const regulatorNav: NavGroup[] = [
  {
    title: '⚖️ REGULATORY VIEW',
    items: [
      { title: 'Compliance Portal', url: '/regulator', icon: ShieldAlert },
      { title: 'Live Alerts', url: '/alerts', icon: Bell, badge: 'unread' },
    ],
  },
  {
    title: '📄 FILINGS',
    items: [
      { title: 'Statutory Reports', url: '/reports', icon: FileSignature },
    ],
  },
  {
    title: '🔍 INSPECT',
    items: [
      { title: 'Mine Map', url: '/mine-map', icon: Map },
    ],
  },
]

const contractorNav: NavGroup[] = [
  {
    title: '🏢 MY COMPANY',
    items: [
      { title: 'Contractor Dashboard', url: '/contractors', icon: Briefcase },
      { title: 'Attendance & Workers', url: '/attendance', icon: CalendarCheck },
    ],
  },
]

const superAdminNav: NavGroup[] = [
  {
    title: '🔧 SYSTEM ADMINISTRATION',
    items: [
      { title: 'System Dashboard', url: '/', icon: LayoutDashboard },
      { title: 'Manage Mines', url: '/admin/mines', icon: Settings },
      { title: 'OCR / Digitization', url: '/ocr', icon: FileScan },
    ],
  },
]

// The "God Mode" view for super admins who want to see absolutely everything
const godModeNav: NavGroup[] = [
  {
    title: 'GOD MODE: ALL MODULES',
    items: [
      { title: 'Home Dashboard', url: '/', icon: LayoutDashboard },
      { title: 'Corporate Dashboard', url: '/corporate-dashboard', icon: LayoutDashboard },
      { title: 'Mine Manager', url: '/mine-manager', icon: LayoutDashboard },
      { title: 'Compliance', url: '/compliance', icon: ShieldAlert },
      { title: 'Inspections', url: '/inspection', icon: Search },
      { title: 'Contractors', url: '/contractors', icon: Users },
      { title: 'Attendance Management', url: '/attendance', icon: CalendarCheck },
      { title: 'Environment', url: '/environment', icon: Leaf },
      { title: 'Production', url: '/production', icon: Activity },
      { title: 'Incidents', url: '/incidents', icon: AlertTriangle },
      { title: 'OCR', url: '/ocr', icon: FileScan },
      { title: 'GIS Map', url: '/mine-map', icon: Map },
      { title: 'Alerts', url: '/alerts', icon: Bell, badge: 'unread' },
      { title: 'Grievances', url: '/grievances', icon: MessageSquare },
      { title: 'AI Analytics', url: '/ai-analytics', icon: BrainCircuit },
      { title: 'Reports', url: '/reports', icon: FileSignature },
      { title: 'Regulator', url: '/regulator', icon: ShieldAlert },
      { title: 'Admin Settings', url: '/admin/mines', icon: Settings },
    ]
  }
]

export const sidebarDataByRole: Record<AppRole | 'god_mode', SidebarData> = {
  super_admin: { user, teams, navGroups: superAdminNav },
  corporate_executive: { user, teams, navGroups: corporateExecutiveNav },
  subsidiary_admin: { user, teams, navGroups: corporateExecutiveNav },
  mine_manager: { user, teams, navGroups: mineManagerNav },
  field_inspector: { user, teams, navGroups: fieldInspectorNav },
  safety_official: { user, teams, navGroups: safetyOfficialNav },
  contractor: { user, teams, navGroups: contractorNav },
  regulator: { user, teams, navGroups: regulatorNav } as any, // type assertion if regulator isn't in AppRole
  god_mode: { user, teams, navGroups: godModeNav }
}
