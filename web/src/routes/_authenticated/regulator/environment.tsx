import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'

function EnvironmentPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">{t(
        "environmental_clearance_ec_con",
        "Environmental Clearance (EC) Conditions"
      )}</h1>
      <p className="text-muted-foreground mt-2">{t(
        "real_time_monitoring_of_caaqms",
        "Real-time monitoring of CAAQMS and water quality against statutory limits."
      )}</p>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/regulator/environment')({
  component: EnvironmentPage,
})
