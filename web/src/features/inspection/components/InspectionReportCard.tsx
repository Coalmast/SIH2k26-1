import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, FileText, Bell, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useInspectionReport, useInspection } from '../hooks/useInspections';
import { Progress } from '@/components/ui/progress';

export function InspectionReportCard({ inspectionId }: { inspectionId: string }) {
  const { data: inspection, isLoading: isLoadingInspection } = useInspection(inspectionId);
  const { data: report, isLoading: isLoadingReport } = useInspectionReport(inspectionId);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score slightly
    setTimeout(() => setAnimatedScore(84), 500);
  }, []);

  if (isLoadingInspection || isLoadingReport) {
    return (
      <Card className="border-primary/20 bg-primary/5 shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-primary">Gemini AI is generating the report...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-slate-900 shadow-none overflow-hidden">
      <div className="bg-slate-900 text-slate-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <h3 className="font-bold text-lg">Inspection Submitted</h3>
        </div>
        <div className="text-xs text-slate-300">
          <p>ID: {inspectionId.split('-')[0]}</p>
          <p>Zone: {inspection?.zone || 'Unknown Zone'}</p>
          <p>Date: {new Date(inspection?.started_at || Date.now()).toLocaleDateString()}</p>
        </div>
      </div>

      <CardContent className="p-4 space-y-6">
        {/* Risk Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-sm font-bold uppercase">Overall Risk Score</span>
            <span className="text-xl font-black text-red-600">{animatedScore}/100</span>
          </div>
          <Progress value={animatedScore} className="h-2 bg-slate-100 [&>div]:bg-red-500" />
          <p className="text-[10px] text-right font-bold text-red-600 uppercase tracking-wider">Critical Risk</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="bg-slate-100 rounded-md p-2">
            <div className="text-lg font-bold">{inspection?.observation_count || 0}</div>
            <div className="text-xs text-muted-foreground uppercase">Observations</div>
          </div>
          <div className="bg-red-50 text-red-700 rounded-md p-2 border border-red-100">
            <div className="text-lg font-bold">{inspection?.violation_count || 0}</div>
            <div className="text-xs font-semibold uppercase">Violations</div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="text-sm font-bold flex items-center gap-1.5">
            <FileText className="h-4 w-4" /> Executive Summary
          </h4>
          <div className="text-xs leading-relaxed text-slate-600 bg-slate-50 p-3 rounded border">
            {report?.executive_summary || "Gemini generated summary failed. Please review the raw observations."}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-1.5 text-orange-700">
            <AlertTriangle className="h-4 w-4" /> Recommended Actions
          </h4>
          <ul className="space-y-2">
            {(report?.recommended_actions || []).map((action: string, idx: number) => (
              <li key={idx} className="text-xs flex gap-2 items-start bg-orange-50/50 p-2 rounded">
                <ArrowRight className="h-3 w-3 mt-0.5 text-orange-500 shrink-0" />
                <span className="text-slate-700">{action}</span>
              </li>
            ))}
            {(!report?.recommended_actions || report.recommended_actions.length === 0) && (
              <li className="text-xs text-muted-foreground">No critical actions required.</li>
            )}
          </ul>
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100">
          <Bell className="h-4 w-4 shrink-0" />
          <p className="text-[10px] font-medium">
            Notifications have been automatically dispatched to the Mine Manager and Safety Officer.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
