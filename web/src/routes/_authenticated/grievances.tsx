import { createFileRoute } from '@tanstack/react-router'
import { GrievancesModule } from '@/features/grievances'

export const Route = createFileRoute('/_authenticated/grievances')({
  component: GrievancesModule,
})
