import { type ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  type NavCollapsible,
  type NavItem,
  type NavLink,
  type NavGroup as NavGroupProps,
} from './types'

// Unique layoutId scope per NavGroup so multiple groups don't share the same pill
let groupCounter = 0

export function NavGroup({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar()
  const href = useLocation({ select: (location) => location.href })
  // Stable per-group layoutId prefix
  const layoutScope = `nav-active-${title.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/40 px-2 mb-1">
        {title}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`

          if (!item.items)
            return (
              <SidebarMenuLink
                key={key}
                item={item}
                href={href}
                layoutScope={layoutScope}
              />
            )

          if (state === 'collapsed' && !isMobile)
            return (
              <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />
            )

          return (
            <SidebarMenuCollapsible
              key={key}
              item={item}
              href={href}
              layoutScope={layoutScope}
            />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavBadge({ children }: { children: ReactNode }) {
  return (
    <Badge className="ml-auto rounded-full px-1.5 py-0 text-[10px] font-semibold bg-primary/15 text-primary border-0 dark:bg-primary/20 dark:text-primary">
      {children}
    </Badge>
  )
}

function SidebarMenuLink({
  item,
  href,
  layoutScope,
}: {
  item: NavLink
  href: string
  layoutScope: string
}) {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item)

  return (
    <SidebarMenuItem className="relative">
      {/* Sliding active background pill */}
      {isActive && (
        <motion.div
          layoutId={layoutScope}
          className="absolute inset-0 rounded-md bg-sidebar-accent"
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className="relative z-10"
      >
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && (
            <item.icon
              className={isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60'}
            />
          )}
          <span className={isActive ? 'font-semibold text-sidebar-foreground' : 'text-sidebar-foreground/80'}>
            {item.title}
          </span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
          {/* Active left accent bar */}
          {isActive && (
            <motion.div
              layoutId={`${layoutScope}-bar`}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-sidebar-primary"
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarMenuCollapsible({
  item,
  href,
  layoutScope,
}: {
  item: NavCollapsible
  href: string
  layoutScope: string
}) {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item, true)

  return (
    <Collapsible
      asChild
      defaultOpen={isActive}
      className="group/collapsible"
    >
      <SidebarMenuItem className="relative">
        {isActive && (
          <motion.div
            layoutId={layoutScope}
            className="absolute inset-0 rounded-md bg-sidebar-accent"
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
        )}
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} className="relative z-10">
            {item.icon && (
              <item.icon
                className={isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60'}
              />
            )}
            <span className={isActive ? 'font-semibold text-sidebar-foreground' : 'text-sidebar-foreground/80'}>
              {item.title}
            </span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto h-3.5 w-3.5 text-sidebar-foreground/40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub className="border-l border-sidebar-border/50 ml-4 pl-2">
            {item.items.map((subItem) => {
              const subActive = checkIsActive(href, subItem)
              return (
                <SidebarMenuSubItem key={subItem.title} className="relative">
                  <SidebarMenuSubButton
                    asChild
                    isActive={subActive}
                    className="relative"
                  >
                    <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                      {subItem.icon && (
                        <subItem.icon
                          className={subActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50'}
                        />
                      )}
                      <span className={subActive ? 'font-medium text-sidebar-foreground' : 'text-sidebar-foreground/70'}>
                        {subItem.title}
                      </span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                  {subActive && (
                    <motion.div
                      layoutId={`${layoutScope}-sub-bar`}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full bg-sidebar-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function SidebarMenuCollapsedDropdown({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={checkIsActive(href, item)}
          >
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto h-3.5 w-3.5 text-sidebar-foreground/40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4} className="rounded-xl">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link
                to={sub.url}
                className={`${checkIsActive(href, sub) ? 'bg-accent text-accent-foreground font-medium' : ''}`}
              >
                {sub.icon && <sub.icon className="h-4 w-4" />}
                <span className="max-w-52 text-wrap">{sub.title}</span>
                {sub.badge && (
                  <span className="ms-auto text-xs">{sub.badge}</span>
                )}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url ||
    href.split('?')[0] === item.url ||
    !!item?.items?.filter((i) => i.url === href).length ||
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.url?.split('/')[1])
  )
}
