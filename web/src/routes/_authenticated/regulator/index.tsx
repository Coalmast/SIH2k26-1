import { createFileRoute } from '@tanstack/react-router'
import { RegulatorDashboard } from '@/features/regulator/RegulatorDashboard'

export const Route = createFileRoute('/_authenticated/regulator/')({
  component: RegulatorDashboard,
})
