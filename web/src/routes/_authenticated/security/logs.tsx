import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'

function LogsPage() {
  const { t } = useTranslation();
  return <div className="p-8 text-foreground">{t("security_logs_page_wip", "Security Logs Page (WIP)")}</div>;
}

export const Route = createFileRoute('/_authenticated/security/logs')({
  component: LogsPage,
})
