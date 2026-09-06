import { createFileRoute } from '@tanstack/react-router'
import { IncidentDetail } from '@/features/incidents/IncidentDetail'

export const Route = createFileRoute('/_authenticated/incidents/$id')({
  component: IncidentDetail,
})
