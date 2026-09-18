import { useTranslation } from "react-i18next";
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'

function EnvironmentPage() {
  const { t } = useTranslation();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">{t(
        "environmental_clearance_ec_con",
        "Environmental Clearance (EC) Conditions"
      )}</h1>
      <p className="text-muted-foreground mt-2">{t(
        "environmental_compliance_monit",
        "Environmental compliance monitoring across all mining operations."
      )}</p>
      <div className="mt-8 bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 font-semibold">Station ID</th>
              <th className="p-4 font-semibold">Mine</th>
              <th className="p-4 font-semibold">PM10 (µg/m³)</th>
              <th className="p-4 font-semibold">Noise (dB)</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="hover:bg-muted/30">
              <td className="p-4">ENV-S1-UMR</td>
              <td className="p-4">Umrer OCP</td>
              <td className="p-4">145.2</td>
              <td className="p-4">82</td>
              <td className="p-4"><Badge className="bg-red-500/10 text-red-600 border-red-500/20" variant="outline">Critical</Badge></td>
            </tr>
            <tr className="hover:bg-muted/30">
              <td className="p-4">ENV-S2-PAD</td>
              <td className="p-4">Padmapur UG</td>
              <td className="p-4">45.8</td>
              <td className="p-4">65</td>
              <td className="p-4"><Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" variant="outline">Normal</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/regulator/environment')({
  component: EnvironmentPage,
})
