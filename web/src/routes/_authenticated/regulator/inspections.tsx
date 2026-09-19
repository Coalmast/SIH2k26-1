import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'

function InspectionsPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">{t("regulatory_inspections_read_on", "Regulatory Inspections (Read-Only)")}</h1>
      <p className="text-muted-foreground mt-2">{t(
        "schedule_and_review_mine_inspect",
        "Schedule and review mine inspections and safety audits."
      )}</p>
      <div className="mt-8 bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 font-semibold">Inspection ID</th>
              <th className="p-4 font-semibold">Mine</th>
              <th className="p-4 font-semibold">Inspector</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-muted/30">
              <td className="p-4">INSP-9001</td>
              <td className="p-4">Umrer OCP</td>
              <td className="p-4">Dr. A. Sharma</td>
              <td className="p-4">Oct 12, 2026</td>
              <td className="p-4"><Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" variant="outline">Completed</Badge></td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="p-4">INSP-9002</td>
              <td className="p-4">Bhatadi OCP</td>
              <td className="p-4">R. Desai</td>
              <td className="p-4">Oct 20, 2026</td>
              <td className="p-4"><Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20" variant="outline">Scheduled</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/regulator/inspections')({
  component: InspectionsPage,
})
