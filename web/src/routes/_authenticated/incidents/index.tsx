import { createFileRoute } from '@tanstack/react-router'
import { IncidentsList } from '@/features/incidents'

export const Route = createFileRoute('/_authenticated/incidents/')({
  component: IncidentsList,
})
