import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { MobileInspectionSimulator } from '@/features/inspection/components/MobileInspectionSimulator'

export const Route = createFileRoute('/_authenticated/mobile-inspection')({
  component: MobileInspectionPage,
})

function MobileInspectionPage() {
  const {
    t
  } = useTranslation();

  return (
    <>


      <Main className='flex flex-1 flex-col'>
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight">{t("mobile_simulator", "Mobile Simulator")}</h2>
          <p className="text-muted-foreground">{t(
            "test_the_field_inspector_s_mob",
            "Test the field inspector's mobile experience."
          )}</p>
        </div>
        <MobileInspectionSimulator />
      </Main>
    </>
  );
}
