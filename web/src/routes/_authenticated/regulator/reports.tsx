import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'

function ReportsPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">{t("statutory_documents_returns", "Statutory Documents & Returns")}</h1>
      <p className="text-muted-foreground mt-2">{t(
        "blockchain_verified_statutory_",
        "Blockchain-verified statutory reports and returns submitted by mines."
      )}</p>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/regulator/reports')({
  component: ReportsPage,
})
