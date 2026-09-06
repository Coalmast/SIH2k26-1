import { createFileRoute } from '@tanstack/react-router'
import { AIAnalyticsModule } from '@/features/analytics'

export const Route = createFileRoute('/_authenticated/ai-analytics')({
  component: AIAnalyticsModule,
})
