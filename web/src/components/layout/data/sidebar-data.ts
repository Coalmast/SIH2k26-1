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
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {

  user: {
    name: 'Mine Official',
    email: 'official@coalmines.gov.in',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Coal India Limited',
      logo: HardHat,
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
          roles: ['super_admin', 'corporate_executive', 'mine_manager'],
        },
        {
          title: 'Inspections',
          url: '/inspection',
          icon: Search,
          roles: ['super_admin', 'mine_manager', 'field_inspector', 'safety_official'],
        },
        {
          title: 'Contractors',
          url: '/contractors',
          icon: Users,
          roles: ['super_admin', 'corporate_executive', 'mine_manager', 'contractor'],
        },
        {
          title: 'Environment',
          url: '/environment',
          icon: Leaf,
          roles: ['super_admin', 'corporate_executive', 'mine_manager', 'safety_official'],
        },
        {
          title: 'Production',
          url: '/production',
          icon: Activity,
          roles: ['super_admin', 'corporate_executive', 'mine_manager'],
        },
        {
          title: 'Incidents',
          url: '/incidents',
          icon: AlertTriangle,
          roles: ['super_admin', 'mine_manager', 'field_inspector', 'safety_official'],
        },
        {
          title: 'OCR / Digitization',
          url: '/ocr',
          icon: FileScan,
          roles: ['super_admin', 'corporate_executive', 'mine_manager'],
        },
        {
          title: 'GIS Map',
          url: '/mine-map',
          icon: Map,
          roles: ['super_admin', 'corporate_executive', 'mine_manager', 'field_inspector', 'safety_official'],
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
          roles: ['super_admin', 'mine_manager', 'contractor'],
        },
        {
          title: 'AI Analytics',
          url: '/ai-analytics',
          icon: BrainCircuit,
          roles: ['super_admin', 'corporate_executive', 'mine_manager'],
        },
        {
          title: 'Reports',
          url: '/reports',
          icon: FileSignature,
          roles: ['super_admin', 'corporate_executive', 'mine_manager', 'safety_official'],
        },
        {
          title: 'Admin',
          url: '/admin/mines',
          icon: Settings,
          roles: ['super_admin'],
        },
      ],
    },
  ],
}
