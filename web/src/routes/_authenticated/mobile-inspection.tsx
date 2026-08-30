import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MobileInspectionSimulator } from '@/features/inspection/components/MobileInspectionSimulator'

export const Route = createFileRoute('/_authenticated/mobile-inspection')({
  component: MobileInspectionPage,
})

function MobileInspectionPage() {
  return (
    <>
      <Header fixed />
      
      <Main className='flex flex-1 flex-col'>
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">Mobile Simulator</h2>
          <p className="text-muted-foreground">Test the field inspector's mobile experience.</p>
        </div>
        <MobileInspectionSimulator />
      </Main>
    </>
  )
}
