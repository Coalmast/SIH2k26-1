import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from "react-i18next";
import { Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

import { KpiCards } from '@/components/mine-manager/kpi-cards';
import { ComplianceCalendar } from '@/components/mine-manager/compliance-calendar';
import { OpenViolationsTable } from '@/components/mine-manager/open-violations-table';
import { LiveAlertFeed } from '@/components/mine-manager/live-alert-feed';
import { EnvironmentalStatus } from '@/components/mine-manager/environmental-status';
import { ProductionTrendChart } from '@/components/mine-manager/production-trend-chart';
import { AIRiskPanel } from '@/components/mine-manager/ai-risk-panel';
import { WorkerAttendanceSummary } from '@/components/mine-manager/worker-attendance-summary';

export const Route = createFileRoute('/_authenticated/mine-manager')({
  component: MineManagerDashboard,
})

function MineManagerDashboard() {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.auth.user);
  
  // Get the primary mine assigned to this user
  // (In a real scenario with multiple mines, there would be a dropdown selector)
  const mineId = user?.mineIds?.[0] || '00000000-0000-0000-0000-000000000004';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background max-w-[1800px] mx-auto w-full">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("mine_command_center", "Mine Command Center")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("overview_for", "Realtime operational overview for ")} <span className="font-semibold text-foreground">Mine ID: {mineId.split('-')[0]}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full border">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {t("live_sync_active", "Live Sync Active")}
        </div>
      </div>

      {/* Top Row: KPI Cards (Full width) */}
      <KpiCards mineId={mineId} />

      {/* Main Body: 2-Column Architecture (Left Content + Right Sidebar) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6 mb-6">
        
        {/* Left Content Area */}
        <div className="flex flex-col gap-6 min-w-0">
          
          {/* Top Row: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
            <div className="min-h-[400px]">
               <ProductionTrendChart mineId={mineId} />
            </div>
            <div className="min-h-[400px]">
              <AIRiskPanel mineId={mineId} />
            </div>
          </div>

          {/* Middle Row: Horizontal Calendar */}
          <div className="min-h-[450px]">
             <ComplianceCalendar mineId={mineId} />
          </div>

          {/* Bottom Row: Open Violations */}
          <div className="min-h-[450px]">
            <OpenViolationsTable mineId={mineId} />
          </div>

        </div>

        {/* Right Sidebar: Live Feeds & Status */}
        <div className="flex flex-col gap-6 min-w-0">
          <div className="min-h-[220px]">
             <EnvironmentalStatus mineId={mineId} />
          </div>
          <div className="min-h-[220px]">
             <WorkerAttendanceSummary mineId={mineId} />
          </div>
          <div className="flex-1 min-h-[600px]">
             <LiveAlertFeed mineId={mineId} />
          </div>
        </div>
      </div>
      
    </div>
  )
}
