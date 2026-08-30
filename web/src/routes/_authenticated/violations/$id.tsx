import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export const Route = createFileRoute('/_authenticated/violations/$id')({
  component: ViolationDetailPage,
})

function ViolationDetailPage() {
  const { id } = Route.useParams()

  return (
    <>
      <Header fixed />
      
      <Main className='flex flex-1 flex-col p-6'>
        <h1 className="text-2xl font-bold tracking-tight mb-4">Violation Details</h1>
        <p className="text-muted-foreground">ID: {id}</p>
        <div className="mt-8 border border-border/50 rounded-lg p-12 text-center text-muted-foreground">
          Violation Details Module under construction.
        </div>
      </Main>
    </>
  )
}
