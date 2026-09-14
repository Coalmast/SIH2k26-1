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
import { ForgotPasswordForm } from './components/forgot-password-form'

export function ForgotPassword() {
  const {
    t
  } = useTranslation();

  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4 sm:min-w-sm'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>{t("forgot_password", "Forgot Password")}</CardTitle>
          <CardDescription>{t("enter_your_registered_email_an", "Enter your registered email and")}<br />{t(
            "we_will_send_you_a_link_to_res",
            "we will send you a link to\n            reset your password."
          )}</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter>
          <p className='mx-auto px-8 text-center text-sm text-balance text-muted-foreground'>{t("don_t_have_an_account", "Don't have an account?")}{' '}
            <Link
              to='/sign-up'
              className='underline underline-offset-4 hover:text-primary'
            >{t("sign_up", "Sign up")}</Link>{t("text", ".")}</p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
