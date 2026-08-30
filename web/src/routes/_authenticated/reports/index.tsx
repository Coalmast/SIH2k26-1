import { createFileRoute } from '@tanstack/react-router'
import { ReportGenerator } from '@/features/reports'

export const Route = createFileRoute('/_authenticated/reports/')({
  component: () => <ReportGenerator />,
})
