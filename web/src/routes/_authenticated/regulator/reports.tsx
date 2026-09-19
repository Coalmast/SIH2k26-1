import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'

function ReportsPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">{t("statutory_documents_returns", "Statutory Documents & Returns")}</h1>
      <p className="text-muted-foreground mt-2">{t(
        "blockchain_verified_statutory_",
        "Blockchain-verified statutory reports and returns submitted by mines."
      )}</p>
      <div className="mt-8 bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 font-semibold">Report ID</th>
              <th className="p-4 font-semibold">Mine</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-muted/30">
              <td className="p-4">RPT-2026-09</td>
              <td className="p-4">Umrer OCP</td>
              <td className="p-4">Monthly Return</td>
              <td className="p-4">Oct 1, 2026</td>
              <td className="p-4"><Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" variant="outline">Verified</Badge></td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="p-4">RPT-2026-08</td>
              <td className="p-4">Padmapur UG</td>
              <td className="p-4">Annual Return</td>
              <td className="p-4">Sep 15, 2026</td>
              <td className="p-4"><Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20" variant="outline">Pending</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/regulator/reports')({
  component: ReportsPage,
})
