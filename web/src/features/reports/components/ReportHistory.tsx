import { useTranslation } from "react-i18next";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Lock, Loader2 } from 'lucide-react';
import { useReportHistory } from '../hooks/useReports';

export function ReportHistory({ mineId }: { mineId: string }) {
  const {
    t
  } = useTranslation();

  const { data: history, isLoading } = useReportHistory(mineId);

  return (
    <Card className="w-full bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle>{t("report_history", "Report History")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("type", "Type")}</TableHead>
              <TableHead>{t("period", "Period")}</TableHead>
              <TableHead>{t("generated_at", "Generated At")}</TableHead>
              <TableHead>{t("status", "Status")}</TableHead>
              <TableHead className="text-right">{t("actions", "Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mx-auto" /></TableCell>
              </TableRow>
            ) : history?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">{t("no_reports_generated_yet", "No reports generated yet")}</TableCell>
              </TableRow>
            ) : (
              history?.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.type}</TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>{new Date(report.generated_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={
                      report.status === 'SUBMITTED' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-yellow-500/10 text-yellow-500'
                    }>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" title="View Hash">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />{t("pdf", "PDF")}</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
