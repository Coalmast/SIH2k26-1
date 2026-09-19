import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'

function IncidentsPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">{t("form_4_a_4_b_incident_records", "Form 4-A / 4-B Incident Records")}</h1>
      <p className="text-muted-foreground mt-2">{t(
        "national_incident_repository",
        "National repository of all reported mine incidents, near-misses, and accidents."
      )}</p>
      <div className="mt-8 bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 font-semibold">Incident ID</th>
              <th className="p-4 font-semibold">Mine</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-muted/30">
              <td className="p-4">INC-1002</td>
              <td className="p-4">Umrer OCP</td>
              <td className="p-4">Machinery Breakdown</td>
              <td className="p-4">Oct 05, 2026</td>
              <td className="p-4"><Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20" variant="outline">High</Badge></td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="p-4">INC-1003</td>
              <td className="p-4">Hindustan Lalpeth</td>
              <td className="p-4">Minor Injury</td>
              <td className="p-4">Oct 07, 2026</td>
              <td className="p-4"><Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20" variant="outline">Low</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/regulator/incidents')({
  component: IncidentsPage,
})
