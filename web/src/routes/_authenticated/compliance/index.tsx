import { createFileRoute } from '@tanstack/react-router'
import { ComplianceCalendar } from '@/features/compliance'

export const Route = createFileRoute('/_authenticated/compliance/')({
  component: () => <ComplianceCalendar />,
})
