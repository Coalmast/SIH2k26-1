import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowRight, LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export function CTAButtons() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center lg:justify-start">
      <Button asChild size="lg" className="w-full sm:w-auto gap-2 text-md h-12 px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
        <Link to="/sign-in">
          <LogIn className="w-5 h-5" />
          {t('landing.signin', 'Sign In')}
        </Link>
      </Button>
      
      <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2 text-md h-12 px-8 rounded-full bg-background/50 backdrop-blur-sm border-border hover:bg-secondary/80 transition-all">
        <Link to="/sign-up">
          <UserPlus className="w-5 h-5" />
          {t('landing.signup', 'Create Account')}
        </Link>
      </Button>
    </div>
  )
}
