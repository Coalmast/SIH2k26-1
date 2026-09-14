import { createFileRoute } from '@tanstack/react-router'
import { ContractorProfile } from '@/features/contractors/ContractorProfile'

export const Route = createFileRoute('/_authenticated/contractors/$id/')({
  component: () => <ContractorProfile id={Route.useParams().id} />,
})
