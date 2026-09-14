import { Shield, ShieldCheck, ShieldAlert, UserIcon, ShieldHalf, HardHat, HardHatIcon, Briefcase } from 'lucide-react'

export const userTypes = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export const callTypes = new Map<string, string>([
  ['active', 'bg-green-500'],
  ['inactive', 'bg-comet-down'],
])

export const roles = [
  { label: 'System Admin', value: 'system_admin', icon: ShieldAlert },
  { label: 'Subsidiary Admin', value: 'subsidiary_admin', icon: ShieldCheck },
  { label: 'Corporate Executive', value: 'corporate_executive', icon: ShieldHalf },
  { label: 'Mine Manager', value: 'mine_manager', icon: Briefcase },
  { label: 'Safety Officer', value: 'safety_officer', icon: HardHatIcon },
  { label: 'Environmental Officer', value: 'environmental_officer', icon: Shield },
  { label: 'Compliance Officer', value: 'compliance_officer', icon: ShieldCheck },
  { label: 'Field Officer', value: 'field_officer', icon: HardHat },
  { label: 'Contractor Manager', value: 'contractor_manager', icon: UserIcon },
  { label: 'Regulator', value: 'regulator', icon: ShieldAlert },
]
