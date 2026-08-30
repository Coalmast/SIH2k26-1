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

export function OpenViolationsTable() {
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
            <TableRow>
              <TableCell className="font-semibold">CMR Reg 68</TableCell>
              <TableCell className="text-muted-foreground">Roof Support Plan deviation at Panel B.</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 rounded-full">
                  Critical
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">14 Days</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">CMR Reg 102</TableCell>
              <TableCell className="text-muted-foreground">PPE Non-compliance observed in Section 4.</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 rounded-full">
                  Moderate
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">3 Days</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Env Rule 14</TableCell>
              <TableCell className="text-muted-foreground">Dust suppression log incomplete.</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-muted text-muted-foreground border-transparent rounded-full">
                  Low
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">1 Day</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
