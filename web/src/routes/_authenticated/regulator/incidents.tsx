import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'

function IncidentsPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">{t("form_4_a_4_b_incident_records", "Form 4-A / 4-B Incident Records")}</h1>
      <p className="text-muted-foreground mt-2">{t(
        "statutory_incident_reporting_r",
        "Statutory incident reporting repository for regulatory review."
      )}</p>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/regulator/incidents')({
  component: IncidentsPage,
})
