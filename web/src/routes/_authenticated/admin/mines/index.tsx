import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Main } from '@/components/layout/main'
import { MinesTable } from '@/features/mines/components/MinesTable'
import { MineOnboardingForm } from '@/features/mines/components/MineOnboardingForm'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { ForbiddenError } from '@/features/errors/forbidden'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/admin/mines/')({
  component: AdminMinesPage,
})

function AdminMinesPage() {
  const {
    t
  } = useTranslation();

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <RoleGuard roles={['super_admin', 'corporate_executive', 'subsidiary_admin']} fallback={<ForbiddenError />}>


      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{t("mine_management", "Mine Management")}</h2>
            <p className='text-muted-foreground'>{t("onboard_and_manage_mining_oper", "Onboard and manage mining operations.")}</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />{t("onboard_mine", "Onboard Mine")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("onboard_new_mine", "Onboard New Mine")}</DialogTitle>
              </DialogHeader>
              <MineOnboardingForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        
        <MinesTable />
      </Main>
    </RoleGuard>
  );
}
