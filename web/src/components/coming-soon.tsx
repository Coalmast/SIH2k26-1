import { useTranslation } from "react-i18next";
import { Telescope } from 'lucide-react'

export function ComingSoon() {
  const {
    t
  } = useTranslation();

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <Telescope size={72} />
        <h1 className='text-4xl leading-tight font-bold'>{t("coming_soon", "Coming Soon!")}</h1>
        <p className='text-center text-muted-foreground'>{t("this_page_has_not_been_created", "This page has not been created yet.")}<br />{t("stay_tuned_though", "Stay tuned though!")}</p>
      </div>
    </div>
  );
}
