import { createFileRoute } from '@tanstack/react-router'
import { ComplianceCalendar } from '@/features/compliance'

export const Route = createFileRoute('/_authenticated/compliance/$mineId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mineId } = Route.useParams()
  return <ComplianceCalendar mineId={mineId} />
}
