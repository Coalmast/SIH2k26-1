import { createFileRoute } from '@tanstack/react-router'
import { SystemHealthDashboard } from '@/features/admin/SystemHealthDashboard'

export const Route = createFileRoute('/_authenticated/admin/')({
  component: SystemHealthDashboard,
})
