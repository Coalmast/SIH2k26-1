import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { formatDistanceToNow } from 'date-fns'

export function OpenViolationsTable() {
  const [violations, setViolations] = useState<any[]>([])
  const { user } = useAuthStore()

  useEffect(() => {
    async function fetchViolations() {
      const mineId = user?.mine_ids?.[0] || '00000000-0000-0000-0000-000000000004'
      
      const { data } = await supabase
        .from('compliance_instances')
        .select(`
          id,
          due_date,
          status,
          compliance_requirements ( title, regulation_reference, severity )
        `)
        .eq('mine_id', mineId)
        .eq('status', 'breached')
        .order('due_date', { ascending: true })
        .limit(5)

      if (data) {
        setViolations(data)
      }
    }
    fetchViolations()
  }, [user?.mine_ids])

  return (
    <Card className="flex flex-col flex-1 shadow-sm mt-6">
      <div className="p-4 border-b bg-muted/30 rounded-t-lg">
        <h2 className="text-lg font-semibold text-foreground">Top Open Violations</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Regulation</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Description</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Severity</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground p-8">
                  No open violations found.
                </TableCell>
              </TableRow>
            ) : (
              violations.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-semibold">{v.compliance_requirements?.regulation_reference || 'Unknown'}</TableCell>
                  <TableCell className="text-muted-foreground line-clamp-1 max-w-[200px] block truncate pt-4 pb-0 border-0">{v.compliance_requirements?.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-full ${
                      v.compliance_requirements?.severity === 'critical' ? 'bg-[#f6465d]/10 dark:bg-red-950/20 text-comet-down border-[#f6465d]/30' :
                      v.compliance_requirements?.severity === 'major' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      'bg-primary/10 text-primary border-primary/30'
                    }`}>
                      {v.compliance_requirements?.severity || 'Moderate'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-comet-down dark:text-comet-down">
                    {formatDistanceToNow(new Date(v.due_date))} ago
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
