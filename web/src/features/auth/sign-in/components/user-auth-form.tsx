import { useTranslation } from "react-i18next";
import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn, Crown, Building2, Pickaxe, Search, ShieldCheck, HardHat, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore, type AppRole } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { DEMO_MODE } from '@/lib/demo-mode'
import { Card } from '@/components/ui/card'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email.' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password.')
    .min(7, 'Password must be at least 7 characters long.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUserMeta } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    }).then(({ error }: any) => {
      setIsLoading(false)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success(`Welcome back, ${data.email}!`)
        
        // Wait for auth store to fetch the role
        setTimeout(() => {
          const { auth } = useAuthStore.getState();
          let targetPath = redirectTo;
          if (!targetPath || targetPath === '/') {
            if (auth.role === 'super_admin' || auth.role === 'corporate_executive') targetPath = '/corporate-dashboard';
            else if (auth.role === 'mine_manager') targetPath = '/mine-manager';
            else if (auth.role === 'regulator') targetPath = '/regulator';
            else targetPath = '/inspection';
          }
          navigate({ to: targetPath, replace: true });
        }, 300);
      }
    })
  }

  const handleDemoLogin = (role: AppRole, path: string) => {
    setUserMeta(role, ['mine-001'], 'sub-001');
    navigate({ to: path, replace: true });
    toast.success(`Signed in as ${role.replace('_', ' ')} (Demo Mode)`);
  }

  if (DEMO_MODE) {
    const roles: { id: AppRole, name: string, icon: any, path: string }[] = [
      { id: 'super_admin', name: 'Super Admin', icon: Crown, path: '/corporate-dashboard' },
      { id: 'corporate_executive', name: 'Corporate Exec', icon: Building2, path: '/corporate-dashboard' },
      { id: 'mine_manager', name: 'Mine Manager', icon: Pickaxe, path: '/mine-manager' },
      { id: 'field_inspector', name: 'Field Inspector', icon: Search, path: '/inspection' },
      { id: 'safety_official', name: 'Safety Official', icon: ShieldCheck, path: '/inspection' },
      { id: 'contractor', name: 'Contractor', icon: HardHat, path: '/contractors' },
      { id: 'regulator', name: 'Regulator', icon: FileText, path: '/regulator' },
    ]

    return (
      <div className={cn('grid gap-4', className)} {...props}>
        <div className="bg-primary/10 text-primary p-3 rounded-md text-sm mb-2 text-center font-semibold border border-primary/20">
          🚀 Demo Mode: Select a role to continue
        </div>
        <div className="grid grid-cols-2 gap-3">
          {roles.map(r => (
            <Card 
              key={r.id}
              className="p-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center text-center gap-2"
              onClick={() => handleDemoLogin(r.id, r.path)}
            >
              <r.icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold">{r.name}</span>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-3', className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-3"
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email", "Email")}</FormLabel>
                <FormControl>
                  <Input placeholder='name@example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem className='relative'>
                <FormLabel>{t("password", "Password")}</FormLabel>
                <FormControl>
                  <PasswordInput placeholder='********' {...field} />
                </FormControl>
                <FormMessage />
                <Link
                  to='/forgot-password'
                  className='absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
                >{t("forgot_password", "Forgot password?")}</Link>
              </FormItem>
            )}
          />
          <Button className='mt-2' disabled={isLoading}>
            {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}{t("sign_in", "Sign in")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
