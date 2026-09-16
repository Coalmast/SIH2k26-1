import { useTranslation } from "react-i18next";
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'

export function Otp() {
  const {
    t
  } = useTranslation();

  return (
    <AuthLayout>
      <Card className='max-w-md gap-4'>
        <CardHeader>
          <CardTitle className='text-base tracking-tight'>{t("two_factor_authentication", "Two-factor Authentication")}</CardTitle>
          <CardDescription>{t("please_enter_the_authenticatio", "Please enter the authentication code.")}<br />{t(
            "we_have_sent_the_authenticatio",
            "We have sent the\n            authentication code to your email."
          )}</CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm />
        </CardContent>
        <CardFooter>
          <p className='px-8 text-center text-sm text-muted-foreground'>{t("haven_t_received_it", "Haven't received it?")}{' '}
            <Link
              to='/sign-in'
              className='underline underline-offset-4 hover:text-primary'
            >{t("resend_a_new_code", "Resend a new code.")}</Link>{t("text", ".")}</p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
