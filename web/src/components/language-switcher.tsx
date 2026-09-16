import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const {
    t
  } = useTranslation();

  const { i18n } = useTranslation()

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t("toggle_language", "Toggle language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toggleLanguage('en')} className={i18n.language === 'en' ? 'bg-accent' : ''}>{t("english", "English")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleLanguage('hi')} className={i18n.language === 'hi' ? 'bg-accent' : ''}>{t("hindi", "हिंदी (Hindi)")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
