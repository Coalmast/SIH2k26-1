import { useTranslation } from "react-i18next";
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Search, Plus, Filter, AlertTriangle, ShieldCheck, UserPlus, HardHat } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const mockWorkers = [
  { id: 'W-001', name: 'Ramesh Kumar', esi: 'ESI-889012', role: 'HEMM Operator', training: 'valid', attendance: 92 },
  { id: 'W-002', name: 'Suresh Singh', esi: 'ESI-112345', role: 'Blaster', training: 'expired', attendance: 78 },
  { id: 'W-003', name: 'Amit Patel', esi: 'ESI-445678', role: 'General Labor', training: 'valid', attendance: 98 },
]

export function ContractorWorkerList({ id }: { id: string }) {
  const {
    t
  } = useTranslation();

  const [search, setSearch] = useState('')

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/50 min-h-screen text-foreground w-full space-y-6">

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
        <Link to="/contractors" className="hover:text-foreground">{t("contractors", "Contractors")}</Link>
        <span>/</span>
        <Link to="/contractors/$id" params={{ id }} className="hover:text-foreground">{id}</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{t("workers_registry", "Workers Registry")}</span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <HardHat className="h-8 w-8 text-foreground/80" />{t("contract_workers_registry", "Contract Workers Registry")}</h1>
          <p className="text-muted-foreground mt-1">{t(
            "manage_active_workforce_esi_de",
            "Manage active workforce, ESI details, and vocational training validities."
          )}</p>
        </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-comet-up">
                <UserPlus className="h-4 w-4 mr-2" />{t("add_worker", "Add Worker")}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t("add_worker", "Add Worker")}</DialogTitle>
                <DialogDescription>Add a new contract worker to the registry.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input placeholder="e.g. Ramesh Kumar" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ESI / EPF No.</label>
                  <Input placeholder="e.g. ESI-889012" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Input placeholder="e.g. HEMM Operator" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Worker</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

      <div className="flex gap-4 items-center bg-background p-3 rounded-lg shadow-sm border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input 
            placeholder="Search workers by name or ESI..." 
            className="pl-9 bg-muted/50 border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" />{t("filter", "Filter")}</Button>
      </div>

      <Card className="shadow-sm border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">{t("worker_details", "Worker Details")}</th>
                <th className="px-6 py-4 font-semibold">{t("role", "Role")}</th>
                <th className="px-6 py-4 font-semibold">{t("esi_epf_no", "ESI / EPF No.")}</th>
                <th className="px-6 py-4 font-semibold">{t("training_status", "Training Status")}</th>
                <th className="px-6 py-4 font-semibold">{t("attendance_30d", "Attendance (30D)")}</th>
                <th className="px-6 py-4 text-right">{t("actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-background">
              {mockWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{worker.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t("id", "ID:")}{worker.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="font-normal">{worker.role}</Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{worker.esi}</td>
                  <td className="px-6 py-4">
                    {worker.training === 'valid' ? (
                      <Badge variant="outline" className="bg-[#0ecb81]/10 text-comet-up border-[#0ecb81]/30">
                        <ShieldCheck className="h-3 w-3 mr-1" />{t("valid", "Valid")}</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-[#f6465d]/10 text-comet-down border-[#f6465d]/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />{t("expired", "Expired")}</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-comet-up" style={{ width: `${worker.attendance}%` }}></div>
                      </div>
                      <span className="font-semibold">{worker.attendance}{t("text", "%")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">{t("edit", "Edit")}</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
