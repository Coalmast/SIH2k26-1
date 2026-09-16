import { createFileRoute } from '@tanstack/react-router'
import { GrievanceDetail } from '@/features/grievances/GrievanceDetail'

export const Route = createFileRoute('/_authenticated/grievances/$id')({
  component: GrievanceDetail,
})
