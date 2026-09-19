import { useTranslation } from "react-i18next";
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function UnauthorisedError() {
  const {
    t
  } = useTranslation();

  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>{t("401", "401")}</h1>
        <span className='font-medium'>{t("unauthorized_access", "Unauthorized Access")}</span>
        <p className='text-center text-muted-foreground'>{t(
          "please_log_in_with_the_appropr",
          "Please log in with the appropriate credentials"
        )}<br />{t("to_access_this_resource", "to access this\n          resource.")}</p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>{t("go_back", "Go Back")}</Button>
          <Button onClick={() => navigate({ to: '/' })}>{t("back_to_home", "Back to Home")}</Button>
        </div>
      </div>
    </div>
  );
}
