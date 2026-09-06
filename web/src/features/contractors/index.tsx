import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HardHat, Plus, Search, Filter, AlertTriangle, CheckCircle2, MoreVertical, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const mockContractors = [
  {
    id: 'C-8921',
    name: 'Balaji Mining Services',
    type: 'Overburden Removal',
    licenseNo: 'CLRA/MP/2025/112',
    expiry: '2026-10-15',
    activeWorkers: 145,
    status: 'active'
  },
  {
    id: 'C-7734',
    name: 'TechDrill Corp',
    type: 'Drilling & Blasting',
    licenseNo: 'CLRA/MP/2024/089',
    expiry: '2026-09-10',
    activeWorkers: 42,
    status: 'warning'
  },
  {
    id: 'C-9102',
    name: 'Apex Haulage',
    type: 'Transportation',
    licenseNo: 'CLRA/MP/2023/344',
    expiry: '2025-12-01',
    activeWorkers: 0,
    status: 'expired'
  }
]

export function ContractorsModule() {
  const [filter, setFilter] = useState('all')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Active</Badge>
      case 'warning': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><AlertTriangle className="h-3 w-3 mr-1" /> Expiring Soon</Badge>
      case 'expired': return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Expired</Badge>
      default: return null
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 max-w-[1200px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <HardHat className="h-8 w-8 text-primary" />
            Contractor Management
          </h1>
          <p className="text-muted-foreground mt-1">Track CLRA licenses, statutory compliance, and worker deployment.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Contractor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm border-emerald-100 bg-emerald-50/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-emerald-800">Active Licenses</div>
              <div className="text-3xl font-black text-emerald-600 mt-1">12</div>
            </div>
            <CheckCircle2 className="h-10 w-10 text-emerald-200" />
          </CardContent>
        </Card>
        <Card className="shadow-sm border-amber-100 bg-amber-50/30">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-amber-800">Expiring &lt; 30 Days</div>
              <div className="text-3xl font-black text-amber-600 mt-1">3</div>
            </div>
            <AlertTriangle className="h-10 w-10 text-amber-200" />
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-600">Total Deployed Workers</div>
              <div className="text-3xl font-black text-slate-800 mt-1">482</div>
            </div>
            <HardHat className="h-10 w-10 text-slate-100" />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contractors by name or license..." className="pl-9" />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Contractor Details</th>
                <th className="px-6 py-4 font-semibold">License (CLRA)</th>
                <th className="px-6 py-4 font-semibold">Validity</th>
                <th className="px-6 py-4 font-semibold">Deployed Workers</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockContractors.map((contractor) => (
                <tr key={contractor.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{contractor.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{contractor.type} • ID: {contractor.id}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{contractor.licenseNo}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span className={contractor.status === 'warning' ? 'text-amber-600 font-medium' : ''}>
                        {new Date(contractor.expiry).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min((contractor.activeWorkers / 200) * 100, 100)}%` }}></div>
                      </div>
                      <span className="font-semibold">{contractor.activeWorkers}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(contractor.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
