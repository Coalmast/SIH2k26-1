import { useAuthStore, AppRole } from '@/stores/auth-store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNavigate } from '@tanstack/react-router'

const ROLES: { value: AppRole; label: string }[] = [
  { value: 'system_admin', label: 'System Admin' },
  { value: 'mine_manager', label: 'Mine Manager' },
  { value: 'corporate_executive', label: 'Corporate Exec' },
  { value: 'subsidiary_admin', label: 'Subsidiary Admin' },
  { value: 'safety_officer', label: 'Safety Officer' },
  { value: 'compliance_officer', label: 'Compliance Officer' },
  { value: 'environmental_officer', label: 'Env. Officer' },
  { value: 'contractor_manager', label: 'Contractor Mgr' },
  { value: 'field_officer', label: 'Field Officer' },
  { value: 'regulator', label: 'Regulator' },
]

export function RoleSwitcher() {
  const { role } = useAuthStore((state) => state.auth)
  const setUserMeta = useAuthStore((state) => state.setUserMeta)
  const navigate = useNavigate()

  const handleRoleChange = (newRole: AppRole) => {
    // Quick mock for dev environment: switch role and force redirect
    setUserMeta(newRole, [], null)
    
    // Redirect logic to show off different dashboards based on role
    if (['corporate_executive', 'subsidiary_admin', 'system_admin'].includes(newRole)) {
      navigate({ to: '/corporate-dashboard', replace: true })
    } else if (newRole === 'mine_manager') {
      navigate({ to: '/mine-manager', replace: true })
    } else if (newRole === 'compliance_officer' || newRole === 'regulator') {
      navigate({ to: '/compliance', replace: true })
    } else {
      navigate({ to: '/mine-manager', replace: true })
    }
  }

  return (
    <div className="px-4 py-2 border-t border-border/50 bg-muted/20">
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Dev Role Switcher</p>
      <Select value={role || ''} onValueChange={handleRoleChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Select a role..." />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r.value} value={r.value} className="text-xs">
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
