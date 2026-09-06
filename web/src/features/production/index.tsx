import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { Pickaxe, Truck, ArchiveBox, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const mockProductionData = [
  { date: '01 Sep', target: 12000, actual: 11500, dispatch: 11000 },
  { date: '02 Sep', target: 12000, actual: 12200, dispatch: 11800 },
  { date: '03 Sep', target: 12000, actual: 12500, dispatch: 12100 },
  { date: '04 Sep', target: 12000, actual: 10800, dispatch: 10500 },
  { date: '05 Sep', target: 12000, actual: 12100, dispatch: 11900 },
  { date: '06 Sep', target: 12000, actual: 13000, dispatch: 12500 },
]

export function ProductionModule() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 max-w-[1400px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Pickaxe className="h-8 w-8 text-primary" />
            Production & Dispatch
          </h1>
          <p className="text-muted-foreground mt-1">Real-time coal production, dispatch metrics, and OIT tracking.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><RefreshCw className="h-4 w-4 mr-2" /> Sync ERP</Button>
          <Button>Generate Daily Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-blue-100 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-800 flex justify-between">
              Today's Production
              <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">On Track</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">4,250 T</div>
            <div className="text-xs text-blue-600/70 mt-1">Target: 12,000 T</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-emerald-100 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-800 flex justify-between">
              Total Dispatched
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">3,800 T</div>
            <div className="text-xs text-emerald-600/70 mt-1">142 Trucks Cleared</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-100 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-800 flex justify-between">
              Pithead Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600">24,500 T</div>
            <div className="text-xs text-amber-600/70 mt-1">Capacity: 50,000 T</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-purple-100 bg-purple-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-800 flex justify-between">
              Active Machinery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-purple-600">42 / 45</div>
            <div className="text-xs text-purple-600/70 mt-1">3 Under Maintenance</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <CardTitle className="text-lg">Production vs Dispatch Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockProductionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
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
            <CardTitle className="text-lg flex justify-between items-center">
              Active Truck Dispatches (OIT)
              <Badge variant="outline" className="bg-slate-100">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Truck className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-bold font-mono text-sm">MH-40-AK-8922</div>
                    <div className="text-xs text-muted-foreground">RFID: 9942 • G9 Grade</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-emerald-500 mb-1">Cleared Weighbridge</Badge>
                  <div className="text-xs text-muted-foreground font-semibold">Net: 32.4 T</div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Truck className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-bold font-mono text-sm">CG-10-BM-1104</div>
                    <div className="text-xs text-muted-foreground">RFID: 7715 • G11 Grade</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 mb-1">At Loading Point</Badge>
                  <div className="text-xs text-muted-foreground font-semibold">Est: 28.0 T</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg">Inventory Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>G8 Grade Coal</span>
                <span>8,400 T</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-800" style={{width: '35%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>G9 Grade Coal</span>
                <span>12,200 T</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600" style={{width: '50%'}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>G11 Grade Coal</span>
                <span>3,900 T</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400" style={{width: '15%'}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
