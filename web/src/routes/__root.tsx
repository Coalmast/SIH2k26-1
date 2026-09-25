import React, { useEffect } from 'react'
import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'
import { supabase } from '@/lib/supabase'
import { DEMO_MODE } from '@/lib/demo-mode'
import { useAuthStore } from '@/stores/auth-store'
import { TooltipProvider } from "@/components/ui/tooltip"
import { DemoAlerts } from "@/components/demo-alerts"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    const { setSession, setIsLoading } = useAuthStore()

    useEffect(() => {
      if (DEMO_MODE) {
        setIsLoading(false)
        return
      }

      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setSession(session)
        setIsLoading(false)
      })

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setSession(session)
      })

      return () => subscription.unsubscribe()
    }, [setSession, setIsLoading])

    return (
      <TooltipProvider>
        <NavigationProgress />
        <Outlet />
        <Toaster duration={5000} />
        <DemoAlerts />
      </TooltipProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
