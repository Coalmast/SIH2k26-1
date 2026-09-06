import { createFileRoute } from '@tanstack/react-router'
import { ComplianceDetail } from '@/features/compliance/components/ComplianceDetail'

export const Route = createFileRoute('/_authenticated/compliance/$id')({
  component: ComplianceDetail,
})
