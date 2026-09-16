import { useTranslation } from "react-i18next";
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function NotFoundError() {
  const {
    t
  } = useTranslation();

  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>{t("404", "404")}</h1>
        <span className='font-medium'>{t("oops_page_not_found", "Oops! Page Not Found!")}</span>
        <p className='text-center text-muted-foreground'>{t(
          "it_seems_like_the_page_you_re_",
          "It seems like the page you're looking for"
        )}<br />{t(
          "does_not_exist_or_might_have_b",
          "does not exist or might have been removed."
        )}</p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>{t("go_back", "Go Back")}</Button>
          <Button onClick={() => navigate({ to: '/' })}>{t("back_to_home", "Back to Home")}</Button>
        </div>
      </div>
    </div>
  );
}
