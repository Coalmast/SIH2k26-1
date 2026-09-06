import { createFileRoute } from '@tanstack/react-router'
import { EnvironmentModule } from '@/features/environment'

export const Route = createFileRoute('/_authenticated/environment')({
  component: EnvironmentModule,
})
