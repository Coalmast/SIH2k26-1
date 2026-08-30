import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ComplianceInstanceDetail } from '@/features/compliance/components/ComplianceInstanceDetail'

export const Route = createFileRoute('/_authenticated/compliance/$instanceId')({
  component: ComplianceInstancePage,
})

function ComplianceInstancePage() {
  const { instanceId } = Route.useParams()

  return (
    <>
      <Header fixed />
      
      <Main className='flex flex-1 flex-col'>
        <ComplianceInstanceDetail instanceId={instanceId} />
      </Main>
    </>
  )
}
