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
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Inspector',
    email: 'inspector@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Mine Operations',
      logo: Activity,
      plan: 'Active',
    }
  ],
  navGroups: [
    {
      title: 'Navigation',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Compliance',
          url: '/compliance',
          icon: ShieldAlert,
          roles: ['compliance_officer', 'mine_manager', 'regulator'],
        },
        {
          title: 'Inspections',
          url: '/inspection',
          icon: Search,
          roles: ['safety_officer', 'mine_manager', 'regulator'],
        },
        {
          title: 'Contractors',
          url: '/contractors',
          icon: Users,
          roles: ['contractor_manager', 'mine_manager'],
        },
        {
          title: 'Environment',
          url: '/environment',
          icon: Leaf,
          roles: ['environmental_officer', 'mine_manager', 'regulator'],
        },
        {
          title: 'Production',
          url: '/production',
          icon: Activity,
          roles: ['mine_manager', 'corporate_executive'],
        },
        {
          title: 'Incidents',
          url: '/incidents',
          icon: AlertTriangle,
          roles: ['safety_officer', 'mine_manager', 'regulator'],
        },
        {
          title: 'OCR / Digitization',
          url: '/ocr',
          icon: FileScan,
          roles: ['compliance_officer', 'system_admin'],
        },
        {
          title: 'GIS Map',
          url: '/mine-map',
          icon: Map,
        },
        {
          title: 'Alerts',
          url: '/alerts',
          icon: Bell,
        },
        {
          title: 'Grievances',
          url: '/grievances',
          icon: MessageSquare,
          roles: ['mine_manager', 'subsidiary_admin'],
        },
        {
          title: 'AI Analytics',
          url: '/ai-analytics',
          icon: BrainCircuit,
          roles: ['mine_manager', 'corporate_executive'],
        },
        {
          title: 'Reports',
          url: '/reports',
          icon: FileSignature,
          roles: ['compliance_officer', 'mine_manager', 'regulator'],
        },
        {
          title: 'Admin',
          url: '/admin/mines',
          icon: Settings,
          roles: ['system_admin', 'subsidiary_admin'],
        },
      ],
    },
  ],
}
