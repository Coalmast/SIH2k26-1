import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardDirector,
})

function DashboardDirector() {
  const { role, isLoading } = useAuthStore((state) => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return; // Wait until role is fetched

    if (role === 'super_admin' || role === 'corporate_executive') {
      navigate({ to: '/corporate-dashboard', replace: true })
    } else if (role === 'mine_manager') {
      navigate({ to: '/mine-manager', replace: true })
    } else if (role === 'safety_official' || role === 'field_inspector') {
      navigate({ to: '/inspection', replace: true })
    } else if (role === 'contractor') {
      navigate({ to: '/contractors', replace: true })
    } else {
      navigate({ to: '/mine-manager', replace: true })
    }
  }, [role, isLoading, navigate])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Routing to your workspace...</p>
      </div>
    </div>
  )
}
