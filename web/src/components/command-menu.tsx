import React, { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, ChevronRight, Laptop, Moon, Sun, Languages, ArrowLeft } from 'lucide-react'
import { useSearch } from '@/context/search-provider'
import { useTheme } from '@/context/theme-provider'
import { useTranslation } from 'react-i18next'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { sidebarDataByRole } from './layout/data/sidebar-data'
import { useAuthStore } from '@/stores/auth-store'
import { ScrollArea } from './ui/scroll-area'

export function CommandMenu() {
  const {
    t
  } = useTranslation();

  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()
  const { i18n } = useTranslation()
  const [page, setPage] = useState('home')

  const role = useAuthStore((state) => state.auth.role)
  const key = (role || 'field_inspector') as keyof typeof sidebarDataByRole
  const sidebarData = sidebarDataByRole[key] || sidebarDataByRole['field_inspector']

  useEffect(() => {
    if (open) {
      setPage('home')
    }
  }, [open])

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pe-1'>
          <CommandEmpty>{t("no_results_found", "No results found.")}</CommandEmpty>
          
          {page === 'home' && (
            <>
              {sidebarData.navGroups.map((group) => (
                <CommandGroup key={group.title} heading={group.title}>
                  {group.items.map((navItem, i) => {
                    if (navItem.url)
                      return (
                        <CommandItem
                          key={`${navItem.url}-${i}`}
                          value={navItem.title}
                          onSelect={() => {
                            runCommand(() => navigate({ to: navItem.url }))
                          }}
                        >
                          <div className='flex size-4 items-center justify-center'>
                            <ArrowRight className='size-2 text-muted-foreground/80' />
                          </div>
                          {navItem.title}
                        </CommandItem>
                      )

                    return navItem.items?.map((subItem, i) => (
                      <CommandItem
                        key={`${navItem.title}-${subItem.url}-${i}`}
                        value={`${navItem.title}-${subItem.url}`}
                        onSelect={() => {
                          runCommand(() => navigate({ to: subItem.url }))
                        }}
                      >
                        <div className='flex size-4 items-center justify-center'>
                          <ArrowRight className='size-2 text-muted-foreground/80' />
                        </div>
                        {navItem.title} <ChevronRight /> {subItem.title}
                      </CommandItem>
                    ))
                  })}
                </CommandGroup>
              ))}
              <CommandSeparator />
              <CommandGroup heading='Settings'>
                <CommandItem onSelect={() => setPage('language')}>
                  <Languages className="mr-2 h-4 w-4" /> 
                  <span>{t("change_language", "Change Language")}</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading='Theme'>
                <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
                  <Sun className="mr-2 h-4 w-4" /> <span>{t("light", "Light")}</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
                  <Moon className='mr-2 h-4 w-4 scale-90' />
                  <span>{t("dark", "Dark")}</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>{t("system", "System")}</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {page === 'language' && (
            <CommandGroup heading='Select Language'>
              <CommandItem onSelect={() => setPage('home')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> <span>{t("back_to_menu", "Back to Menu")}</span>
              </CommandItem>
              <CommandSeparator className="my-2" />
              <CommandItem onSelect={() => runCommand(() => i18n.changeLanguage('en'))}>
                <span>{t("english", "English")}</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => i18n.changeLanguage('hi'))}>
                <span>{t("hindi", "हिंदी (Hindi)")}</span>
              </CommandItem>
            </CommandGroup>
          )}

        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}
