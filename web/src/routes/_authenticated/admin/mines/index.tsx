import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MinesTable } from '@/features/mines/components/MinesTable'
import { MineOnboardingForm } from '@/features/mines/components/MineOnboardingForm'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/admin/mines/')({
  component: AdminMinesPage,
})

function AdminMinesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <RoleGuard roles={['subsidiary_admin']} fallback={<div>Access Denied</div>}>
      <Header fixed />
      
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Mine Management</h2>
            <p className='text-muted-foreground'>
              Onboard and manage mining operations.
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Onboard Mine
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Onboard New Mine</DialogTitle>
              </DialogHeader>
              <MineOnboardingForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        
        <MinesTable />
      </Main>
    </RoleGuard>
  )
}
