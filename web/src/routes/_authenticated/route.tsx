import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { supabase } from '@/lib/supabase'
import { DEMO_MODE } from '@/lib/demo-mode'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    if (DEMO_MODE) return
    let { session, isLoading } = useAuthStore.getState().auth
    
    // If it's the initial page load, check supabase directly
    if (!session && isLoading) {
      const { data } = await supabase.auth.getSession()
      session = data.session
      // We purposefully do NOT call setSession here because __root.tsx 
      // will handle it, and calling it here can cause race conditions 
      // with the role fetching. We just need to know if they are logged in.
    }
    
    if (!session) {
      throw redirect({
        to: '/sign-in',
      })
    }
  },
  component: AuthenticatedLayout,
})
