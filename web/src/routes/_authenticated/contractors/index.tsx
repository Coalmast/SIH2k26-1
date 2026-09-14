import { createFileRoute } from '@tanstack/react-router'
import { ContractorsModule } from '@/features/contractors'

export const Route = createFileRoute('/_authenticated/contractors/')({
  component: ContractorsModule,
})
