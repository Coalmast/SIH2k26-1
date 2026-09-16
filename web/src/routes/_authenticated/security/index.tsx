import { createFileRoute } from '@tanstack/react-router'
import { GateKioskDashboard } from '@/features/security/GateKioskDashboard'

export const Route = createFileRoute('/_authenticated/security/')({
  component: GateKioskDashboard,
})
