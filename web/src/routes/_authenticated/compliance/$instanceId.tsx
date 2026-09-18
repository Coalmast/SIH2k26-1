import { createFileRoute } from '@tanstack/react-router'

import { Main } from '@/components/layout/main'
import { ComplianceInstanceDetail } from '@/features/compliance/components/ComplianceInstanceDetail'

export const Route = createFileRoute('/_authenticated/compliance/$instanceId')({
  component: ComplianceInstancePage,
})

import { useAuthStore } from '@/stores/auth-store'

function ComplianceInstancePage() {
  const { instanceId } = Route.useParams()
  const { auth } = useAuthStore()

  return (
    <>

      
      <Main className='flex flex-1 flex-col'>
        <ComplianceInstanceDetail instanceId={instanceId} mineId={auth.mineIds?.[0] ?? ''} />
      </Main>
    </>
  )
}
