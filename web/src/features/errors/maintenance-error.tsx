import { useTranslation } from "react-i18next";
import { Button } from '@/components/ui/button'

export function MaintenanceError() {
  const {
    t
  } = useTranslation();

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>{t("503", "503")}</h1>
        <span className='font-medium'>{t("website_is_under_maintenance", "Website is under maintenance!")}</span>
        <p className='text-center text-muted-foreground'>{t(
          "the_site_is_not_available_at_t",
          "The site is not available at the moment."
        )}<br />{t("we_ll_be_back_online_shortly", "We'll be back online shortly.")}</p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline'>{t("learn_more", "Learn more")}</Button>
        </div>
      </div>
    </div>
  );
}
