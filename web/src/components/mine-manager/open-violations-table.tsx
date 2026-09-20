import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Plus } from 'lucide-react';

export function OpenViolationsTable({ mineId }: { mineId?: string }) {
  const { t } = useTranslation();
  const [violations, setViolations] = useState<any[]>([]);

  useEffect(() => {
    if (!mineId) return;

    async function fetchViolations() {
      // Return mock data for frontend demo
      setViolations([
        { id: 'v1', created_at: new Date().toISOString(), severity: 'critical', statute_reference: 'CMR 2017, Reg. 116', description: 'Ventilation reading below prescribed limit at Return Airway.', status: 'open' },
        { id: 'v2', created_at: new Date(Date.now() - 86400000).toISOString(), severity: 'high', statute_reference: 'EP Act 1986, Sch VII', description: 'Dust suppression system at crusher not operational.', status: 'open' },
        { id: 'v3', created_at: new Date(Date.now() - 172800000).toISOString(), severity: 'moderate', statute_reference: 'CMR 2017, Reg. 100', description: 'Roof support props found inadequate at Face No. 3.', status: 'open' },
      ]);
    }
    fetchViolations();

    const channel = supabase
      .channel(`violations:mine_id=eq.${mineId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'violations', filter: `mine_id=eq.${mineId}` },
        () => {
          fetchViolations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mineId]);

  return (
    <Card className="flex flex-col flex-1 shadow-sm card-neon-top bg-card h-full">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-semibold text-foreground">{t("top_open_violations", "Top Open Violations")}</h2>
      </div>
      <div className="overflow-x-auto overflow-y-auto flex-1 w-full relative p-4">
        <Table className="w-full">
          <TableHeader className="bg-muted/10 sticky top-0 z-20">
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">{t("regulation", "Regulation")}</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">{t("description", "Description")}</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">{t("severity", "Severity")}</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">{t("age", "Age")}</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold text-right">{t("action", "Action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {violations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground p-8">{t("no_open_violations_found", "No open violations found.")}</TableCell>
              </TableRow>
            ) : (
              violations.map((v) => (
                <TableRow key={v.id} className={v.severity === 'critical' ? 'glow-critical relative z-10' : ''}>
                  <TableCell className="font-semibold whitespace-nowrap">{v.statute_reference || 'Unknown'}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{v.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`rounded-full ${
                      v.severity === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                      v.severity === 'high' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      'bg-primary/10 text-primary border-primary/30'
                    }`}>
                      {v.severity || 'Moderate'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-comet-down whitespace-nowrap">
                    {formatDistanceToNow(new Date(v.created_at))} {t("ago", "ago")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to="/violations/$id" params={{ id: v.id }}>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10">
                        <Plus className="h-3 w-3 mr-1" /> {t("assign_capa", "CAPA")}
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
