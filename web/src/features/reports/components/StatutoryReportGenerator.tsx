import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGenerateReport, useReportJob } from '../hooks/useReports';
import { Loader2, FileText, Download, CheckCircle2 } from 'lucide-react';

export function StatutoryReportGenerator({ mineId }: { mineId: string }) {
  const [type, setType] = useState('Annual Return (Form 3)');
  const [periodStart, setPeriodStart] = useState('2026-04-01');
  const [periodEnd, setPeriodEnd] = useState('2027-03-31');
  const [jobId, setJobId] = useState<string | null>(null);

  const generateReport = useGenerateReport();
  const { data: jobData } = useReportJob(jobId);

  const handleGenerate = async () => {
    try {
      const res = await generateReport.mutateAsync({
        type,
        mine_id: mineId,
        period_start: periodStart,
        period_end: periodEnd
      });
      setJobId(res.job_id);
    } catch (e) {
      console.error('Generation failed', e);
    }
  };

  return (
    <Card className="w-full bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle>Generate Statutory Document</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Annual Return (Form 3)">Annual Return (CMR Form 3)</SelectItem>
                <SelectItem value="Accident Notice (Form 4-A)">Accident Notice (CMR Form 4-A)</SelectItem>
                <SelectItem value="Monthly Safety Committee Minutes">Monthly Safety Committee Minutes</SelectItem>
                <SelectItem value="Half-Yearly EC Compliance Report">Half-Yearly EC Compliance Report</SelectItem>
                <SelectItem value="Production Return (Form I)">Production Return (CCO Form I)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleGenerate} disabled={generateReport.isPending || (jobData && jobData.status !== 'completed')} className="gap-2">
            {generateReport.isPending || (jobData && jobData.status !== 'completed') ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {generateReport.isPending || (jobData && jobData.status !== 'completed') ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>

        {jobData && jobData.status === 'completed' && (
          <div className="mt-4 p-6 border border-border/50 rounded-lg bg-background flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Generation Complete</span>
              </div>
              <Button variant="outline" className="gap-2" onClick={() => window.open(jobData.result.file_url, '_blank')}>
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
            <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
              SHA-256: {jobData.result.hash}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-primary text-primary-foreground">Review & Digital Sign</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
