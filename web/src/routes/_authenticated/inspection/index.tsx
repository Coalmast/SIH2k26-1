import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useInspections } from '@/features/inspection/hooks/useInspections'
import { InspectionCard } from '@/features/inspection/components'
import { ScheduleInspectionForm } from '@/features/inspection/forms/ScheduleInspectionForm'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/inspection/')({
  component: InspectionListPage,
})

function InspectionListPage() {
  const [mineId, setMineId] = useState('all')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: inspections, isLoading, error } = useInspections({ mineId, type, status })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Inspections</h1>
          <p className="text-muted-foreground">Field inspection records & DGMS compliance</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="dgms_annual_general">DGMS Annual</SelectItem>
              <SelectItem value="internal_safety_committee">Safety Committee</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                + Schedule Inspection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Inspection</DialogTitle>
              </DialogHeader>
              <ScheduleInspectionForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-md">Failed to load inspections.</div>
      ) : inspections?.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-slate-50 text-slate-500">
          No inspections found matching the filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inspections?.map((inspection: any) => (
            <InspectionCard key={inspection.id} inspection={inspection} />
          ))}
        </div>
      )}
    </div>
  )
}
