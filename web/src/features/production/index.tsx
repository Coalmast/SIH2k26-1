import { useTranslation } from "react-i18next";
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { Pickaxe, Truck, ArchiveX, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const mockProductionData = [
  { date: '01 Sep 26', target: 12000, actual: 11500, dispatch: 11000 },
  { date: '02 Sep 26', target: 12000, actual: 12200, dispatch: 11800 },
  { date: '03 Sep 26', target: 12000, actual: 12500, dispatch: 12100 },
  { date: '04 Sep 26', target: 12000, actual: 10800, dispatch: 10500 },
  { date: '05 Sep 26', target: 12000, actual: 12100, dispatch: 11900 },
  { date: '06 Sep 26', target: 12000, actual: 13000, dispatch: 12500 },
]

export function ProductionModule() {
  const {
    t
  } = useTranslation();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/30 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Pickaxe className="h-8 w-8 text-primary" />{t("production_dispatch", "Production & Dispatch")}</h1>
          <p className="text-muted-foreground mt-1">{t(
            "real_time_coal_production_disp",
            "Real-time coal production, dispatch metrics, and OIT tracking."
          )}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" />{t("sync_erp", "Sync ERP")}</Button>
          <Button>{t("generate_daily_report", "Generate Daily Report")}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-border bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex justify-between">{t("today_s_production", "Today's Production")}<Badge variant="outline" className="bg-muted text-foreground hover:bg-muted">{t("on_track", "On Track")}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{t("4_250_t", "4,250 T")}</div>
            <div className="text-xs text-muted-foreground mt-1">{t("target_12_000_t", "Target: 12,000 T")}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex justify-between">{t("total_dispatched", "Total Dispatched")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-comet-up">{t("3_800_t", "3,800 T")}</div>
            <div className="text-xs text-muted-foreground mt-1">{t("142_trucks_cleared", "142 Trucks Cleared")}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex justify-between">{t("pithead_stock", "Pithead Stock")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-500">{t("24_500_t", "24,500 T")}</div>
            <div className="text-xs text-muted-foreground mt-1">{t("capacity_50_000_t", "Capacity: 50,000 T")}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex justify-between">{t("active_machinery", "Active Machinery")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-purple-500">{t("42_45", "42 / 45")}</div>
            <div className="text-xs text-muted-foreground mt-1">{t("3_under_maintenance", "3 Under Maintenance")}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <CardTitle className="text-lg">{t(
            "production_vs_dispatch_trend_l",
            "Production vs Dispatch Trend (Last 7 Days)"
          )}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockProductionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                <Bar dataKey="target" name="Target (T)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Production (T)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dispatch" name="Dispatch (T)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg flex justify-between items-center">{t("active_truck_dispatches_oit", "Active Truck Dispatches (OIT)")}<Badge variant="outline" className="bg-muted">{t("live", "Live")}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-bold font-mono text-sm">{t("mh_40_ak_8922", "MH-40-AK-8922")}</div>
                    <div className="text-xs text-muted-foreground">{t("rfid_9942_g9_grade", "RFID: 9942 • G9 Grade")}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-comet-up mb-1">{t("cleared_weighbridge", "Cleared Weighbridge")}</Badge>
                  <div className="text-xs text-muted-foreground font-semibold">{t("net_32_4_t", "Net: 32.4 T")}</div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-bold font-mono text-sm">{t("cg_10_bm_1104", "CG-10-BM-1104")}</div>
                    <div className="text-xs text-muted-foreground">{t("rfid_7715_g11_grade", "RFID: 7715 • G11 Grade")}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/30 mb-1">{t("at_loading_point", "At Loading Point")}</Badge>
                  <div className="text-xs text-muted-foreground font-semibold">{t("est_28_0_t", "Est: 28.0 T")}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg">{t("inventory_breakdown", "Inventory Breakdown")}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>{t("g8_grade_coal", "G8 Grade Coal")}</span>
                <span>{t("8_400_t", "8,400 T")}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-muted" style={{width: '35%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>{t("g9_grade_coal", "G9 Grade Coal")}</span>
                <span>{t("12_200_t", "12,200 T")}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-slate-600" style={{width: '50%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>{t("g11_grade_coal", "G11 Grade Coal")}</span>
                <span>{t("3_900_t", "3,900 T")}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-slate-400" style={{width: '15%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
