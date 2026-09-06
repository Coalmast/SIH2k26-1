import { createFileRoute } from '@tanstack/react-router'
import { ProductionModule } from '@/features/production'

export const Route = createFileRoute('/_authenticated/production')({
  component: ProductionModule,
})
