import { useTranslation } from "react-i18next";
import { useNavigate, useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
}

export function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const {
    t
  } = useTranslation();

  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className={cn('h-svh w-full', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        {!minimal && (
          <h1 className='text-[7rem] leading-tight font-bold'>{t("500", "500")}</h1>
        )}
        <span className='font-medium'>{t("oops_something_went_wrong", "Oops! Something went wrong")}{`:')`}</span>
        <p className='text-center text-muted-foreground'>{t("we_apologize_for_the_inconveni", "We apologize for the inconvenience.")}<br />{t("please_try_again_later", "Please try again later.")}</p>
        {!minimal && (
          <div className='mt-6 flex gap-4'>
            <Button variant='outline' onClick={() => history.go(-1)}>{t("go_back", "Go Back")}</Button>
            <Button onClick={() => navigate({ to: '/' })}>{t("back_to_home", "Back to Home")}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
