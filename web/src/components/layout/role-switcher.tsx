import { useTranslation } from "react-i18next";
import { useAuthStore, type AppRole } from '@/stores/auth-store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNavigate } from '@tanstack/react-router'

const ROLES: { value: AppRole; label: string }[] = [
  { value: 'super_admin', label: '👑 Super Admin' },
  { value: 'corporate_executive', label: '🏢 Corporate & Subsidiary Mgmt' },
  { value: 'mine_manager', label: '⛏️ Mine Manager' },
  { value: 'field_inspector', label: '🔍 Field Inspector' },
  { value: 'safety_official', label: '🦺 Safety Official' },
  { value: 'contractor', label: '🏗️ Contractor & Vendor' },
]

export function RoleSwitcher() {
  const {
    t
  } = useTranslation();

  const { role } = useAuthStore((state) => state.auth)
  const setUserMeta = useAuthStore((state) => state.setUserMeta)
  const navigate = useNavigate()

  const handleRoleChange = (newRole: AppRole) => {
    // Quick mock for dev environment: switch role and force redirect
    setUserMeta(newRole, [], null)
    
    // Redirect logic to show off different dashboards based on role
    if (['super_admin', 'corporate_executive'].includes(newRole)) {
      navigate({ to: '/corporate-dashboard', replace: true })
    } else if (newRole === 'mine_manager') {
      navigate({ to: '/mine-manager', replace: true })
    } else if (newRole === 'safety_official' || newRole === 'field_inspector') {
      navigate({ to: '/inspection', replace: true })
    } else if (newRole === 'contractor') {
      navigate({ to: '/contractors', replace: true })
    } else {
      navigate({ to: '/mine-manager', replace: true })
    }
  }

  return (
    <div className="px-4 py-2 border-t border-border/50 bg-muted/20">
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">{t("dev_role_switcher", "Dev Role Switcher")}</p>
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
  );
}
