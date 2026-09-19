import * as React from 'react'
import { Flame, ChevronsUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { BorderBeam } from '@/components/ui/border-beam'
import { motion } from 'framer-motion'

type TeamSwitcherProps = {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}

export function TeamSwitcher({ teams }: TeamSwitcherProps) {
  const { isMobile, state } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState(teams[0])
  const isCollapsed = state === 'collapsed'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60 transition-all duration-200"
            >
              {/* COMET Logo Mark with border-beam on first mount */}
              <div className="relative flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary/20 ring-1 ring-sidebar-primary/40 shrink-0 overflow-hidden">
                <activeTeam.logo className="size-4 text-sidebar-primary" />
                <BorderBeam
                  size={50}
                  duration={4}
                  colorFrom="transparent"
                  colorTo="#f97316"
                  borderWidth={1.5}
                />
              </div>

              <motion.div
                className="grid flex-1 text-start leading-tight overflow-hidden"
                animate={{ opacity: isCollapsed ? 0 : 1 }}
                transition={{ duration: 0.15 }}
              >
                <span className="truncate text-sm font-bold text-sidebar-foreground tracking-tight">
                  {activeTeam.name}
                </span>
                <span className="truncate text-[10px] font-medium text-sidebar-foreground/50 uppercase tracking-widest">
                  {activeTeam.plan}
                </span>
              </motion.div>

              <ChevronsUpDown className="ms-auto h-4 w-4 text-sidebar-foreground/40 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border-border/60"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 pt-1">
              Switch Mine / Subsidiary
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2.5 p-2 rounded-lg cursor-pointer"
              >
                <div className="flex size-6 items-center justify-center rounded-md border border-border/50 bg-muted/50">
                  <team.logo className="size-3.5 shrink-0 text-foreground/70" />
                </div>
                <span className="font-medium">{team.name}</span>
                <DropdownMenuShortcut className="text-muted-foreground">
                  ⌘{index + 1}
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
