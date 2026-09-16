import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'

function InspectionsPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">{t("regulatory_inspections_read_on", "Regulatory Inspections (Read-Only)")}</h1>
      <p className="text-muted-foreground mt-2">{t(
        "this_module_provides_dgms_offi",
        "This module provides DGMS officers with read-only access to all inspection records across subsidiaries."
      )}</p>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/regulator/inspections')({
  component: InspectionsPage,
})
