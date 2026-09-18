import { createFileRoute } from '@tanstack/react-router'
import { TrendingUp } from 'lucide-react'

import { KpiCards } from '@/components/mine-manager/kpi-cards'
import { ComplianceCalendar } from '@/components/mine-manager/compliance-calendar'
import { OpenViolationsTable } from '@/components/mine-manager/open-violations-table'
import { LiveAlertFeed } from '@/components/mine-manager/live-alert-feed'
import { EnvironmentalStatus } from '@/components/mine-manager/environmental-status'
import { ProductionTrendChart } from '@/components/mine-manager/production-trend-chart'
import { RiskScoreGauge } from '@/components/shared/RiskScoreGauge'

export const Route = createFileRoute('/_authenticated/mine-manager')({
  component: MineManagerDashboard,
})

function MineManagerDashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background max-w-[1600px] mx-auto w-full">
      {/* Mobile Risk Score (visible only on small screens) */}
      <div className="lg:hidden mb-6">
        <RiskScoreGauge score={67} label="Overall Risk Score" trend="up" />
      </div>

      <KpiCards />

      {/* Main Body Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left 2/3: Core Operations & Compliance */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ProductionTrendChart />
          <ComplianceCalendar />
          <OpenViolationsTable />
        </div>

        {/* Right 1/3: Real-time Risk & Environment */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <LiveAlertFeed />
          <EnvironmentalStatus />
        </div>
      </div>
    </div>
  )
}

