import { createFileRoute } from '@tanstack/react-router'
import { WorkerApp } from '@/features/worker/WorkerApp'

export const Route = createFileRoute('/_authenticated/worker/')({
  component: WorkerApp,
})
