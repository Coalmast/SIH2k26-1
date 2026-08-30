import { createFileRoute } from '@tanstack/react-router'
import { ComplianceInstanceDetail } from '@/features/compliance'

export const Route = createFileRoute('/_authenticated/compliance/$mineId/$instanceId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mineId, instanceId } = Route.useParams()
  return <ComplianceInstanceDetail mineId={mineId} instanceId={instanceId} />
}
