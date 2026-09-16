import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarDataByRole } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useAuthStore } from '@/stores/auth-store'
import { useAlertStore } from '@/stores/alert-store'
import { useMemo, useState } from 'react'
import { RoleSwitcher } from './role-switcher'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const role = useAuthStore((state) => state.auth.role)
  const unreadAlerts = useAlertStore((state) => state.unreadCount)
  
  // Hidden God Mode for super admin
  const [isGodMode, setIsGodMode] = useState(false)

  const activeSidebarData = useMemo(() => {
    // If super admin and god mode is on, show everything
    if (role === 'super_admin' && isGodMode) {
      return sidebarDataByRole['god_mode']
    }
    
    // Otherwise use role-based view, default to field_inspector if not found
    const key = (role || 'field_inspector') as keyof typeof sidebarDataByRole
    const data = sidebarDataByRole[key] || sidebarDataByRole['field_inspector']
    
    return data
  }, [role, isGodMode])

  const navGroupsWithBadges = useMemo(() => {
    return activeSidebarData.navGroups.map(group => {
      const items = group.items.map(item => {
        // Inject live badge count for alerts if configured
        if (item.badge === 'unread' && unreadAlerts > 0) {
          return { ...item, badge: unreadAlerts.toString() }
        } else if (item.badge === 'unread') {
           // hide badge if 0
           return { ...item, badge: undefined }
        }
        return item
      })
      return { ...group, items }
    })
  }, [activeSidebarData, unreadAlerts])

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={activeSidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {navGroupsWithBadges.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className="p-0 border-t-0 relative">
        <NavUser user={activeSidebarData.user} />
        <RoleSwitcher />
        
        {/* Hidden trigger for Super Admin God Mode */}
        {role === 'super_admin' && (
          <div 
            className="absolute bottom-2 left-2 w-4 h-4 cursor-pointer opacity-0" 
            onDoubleClick={() => setIsGodMode(!isGodMode)}
            title="Toggle God Mode"
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
