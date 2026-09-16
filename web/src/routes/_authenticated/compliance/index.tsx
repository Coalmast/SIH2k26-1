import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ComplianceCalendar } from '@/features/compliance/components/ComplianceCalendar'
import { ComplianceKanban } from '@/features/compliance/components/ComplianceKanban'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/_authenticated/compliance/')({
  component: CompliancePage,
})

function CompliancePage() {
  const {
    t
  } = useTranslation();

  const [view, setView] = useState<'kanban' | 'calendar'>('kanban')

  return (
    <>
      <Header fixed />

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{t("compliance_management", "Compliance Management")}</h2>
            <p className='text-muted-foreground'>{t(
              "track_submit_and_approve_compl",
              "Track, submit, and approve compliance tasks."
            )}</p>
          </div>
          
          <Tabs value={view} onValueChange={(v) => setView(v as 'kanban' | 'calendar')} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="kanban">{t("kanban_board", "Kanban Board")}</TabsTrigger>
              <TabsTrigger value="calendar">{t("calendar_view", "Calendar View")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {view === 'kanban' ? (
          <ComplianceKanban />
        ) : (
          <ComplianceCalendar />
        )}
      </Main>
    </>
  );
}
