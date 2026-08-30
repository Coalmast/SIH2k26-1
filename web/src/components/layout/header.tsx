import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { MineSelector } from '@/components/shared/MineSelector'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    document.addEventListener('scroll', onScroll, { passive: true })
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4',
          offset > 10 &&
            fixed &&
            'after:absolute after:inset-0 after:-z-10 after:bg-background/20 after:backdrop-blur-lg'
        )}
      >
        <SidebarTrigger variant='outline' className='max-md:scale-125' />
        <Separator orientation='vertical' className='h-6' />
        
        {/* Left side (page-specific breadcrumbs etc.) */}
        <div className="flex-1 flex items-center gap-4">
           {children}
        </div>
        
        {/* Right side standardized TopBar */}
        <div className="flex items-center gap-2">
           <MineSelector />
           
           <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
             <Bell className="h-5 w-5" />
             <span className="absolute top-1 right-2 h-2 w-2 bg-red-500 rounded-full border border-background"></span>
           </Button>
           
           <Button variant="ghost" size="sm" className="font-semibold text-xs text-muted-foreground hover:text-foreground">
             EN
           </Button>
           
           <ThemeSwitch />
           <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}
