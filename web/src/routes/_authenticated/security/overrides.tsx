import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'

function OverridesPage() {
  const { t } = useTranslation();
  return <div className="p-8 text-foreground">{t("security_overrides_page_wip", "Security Overrides Page (WIP)")}</div>;
}

export const Route = createFileRoute('/_authenticated/security/overrides')({
  component: OverridesPage,
})
