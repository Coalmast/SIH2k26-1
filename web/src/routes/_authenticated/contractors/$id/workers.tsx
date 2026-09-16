import { createFileRoute } from '@tanstack/react-router'
import { ContractorWorkerList } from '@/features/contractors/ContractorWorkerList'

export const Route = createFileRoute('/_authenticated/contractors/$id/workers')({
  component: () => <ContractorWorkerList id={Route.useParams().id} />,
})
