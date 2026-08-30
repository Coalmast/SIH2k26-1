import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { InspectionDetail } from '@/features/inspection/components/InspectionDetail'

export const Route = createFileRoute('/_authenticated/inspection/$id')({
  component: InspectionDetailPage,
})

function InspectionDetailPage() {
  const { id } = Route.useParams()

  return (
    <>
      <Header fixed />
      
      <Main className='flex flex-1 flex-col'>
        <InspectionDetail id={id} />
      </Main>
    </>
  )
}
