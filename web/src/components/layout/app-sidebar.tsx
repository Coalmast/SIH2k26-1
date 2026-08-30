import { useLayout } from '@/context/layout-provider'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useAuthStore } from '@/stores/auth-store'
import { useMemo } from 'react'
import { NavItem } from './types'
import { RoleSwitcher } from './role-switcher'

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const role = useAuthStore((state) => state.auth.role)

  const filteredNavGroups = useMemo(() => {
    return sidebarData.navGroups.map(group => {
      const filteredItems = group.items.filter((item: NavItem) => {
        if (role === 'system_admin') return true; // System admin sees everything
        if (!item.roles || item.roles.length === 0) return true; // Available to all roles
        if (role && item.roles.includes(role)) return true; // Role has permission
        return false;
      });
      return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);
  }, [role]);

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className="p-0 border-t-0">
        <NavUser user={sidebarData.user} />
        <RoleSwitcher />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
