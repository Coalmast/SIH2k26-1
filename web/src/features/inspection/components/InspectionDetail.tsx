import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { useInspection, useSubmitInspection, useAnalyzeInspection } from '../hooks/useInspections';
import { AddObservationForm } from './AddObservationForm';
import { AnomalyResultCard } from './AnomalyResultCard';
import { SeverityChip } from '@/components/shared/SeverityChip';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Calendar, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function InspectionDetail({ id }: { id: string }) {
  const {
    t
  } = useTranslation();

  const { data: inspection, isLoading } = useInspection(id);
  const submitInspection = useSubmitInspection();
  const analyzeInspection = useAnalyzeInspection();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!inspection) {
    return <div className="p-12 text-center text-muted-foreground">{t("inspection_not_found", "Inspection not found")}</div>;
  }

  const handleAnalyze = async () => {
    try {
      const result = await analyzeInspection.mutateAsync(id);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to analyze:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitInspection.mutateAsync(id);
    } catch (error) {
      console.error('Failed to submit inspection:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("inspection_details", "Inspection Details")}</h1>
          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
            <span className="capitalize">{t("type", "Type:")}{inspection.inspection_type}</span>
            <span>{t("text", "•")}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(inspection.started_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={inspection.status} />
          {(inspection.status === 'in_progress' || inspection.status === 'draft') && (
            <>
              <Button onClick={handleAnalyze} disabled={analyzeInspection.isPending || (inspection.observations?.length || 0) === 0} variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5">
                {analyzeInspection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}{t("analyze_anomalies", "Analyze Anomalies")}</Button>
              <Button onClick={handleSubmit} disabled={submitInspection.isPending} className="gap-2">
                {submitInspection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}{t("complete_inspection", "Complete Inspection")}</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("observations", "Observations")}</CardTitle>
            {inspection.status === 'in_progress' && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />{t("add_observation", "Add Observation")}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("add_observation", "Add Observation")}</DialogTitle>
                  </DialogHeader>
                  <AddObservationForm inspectionId={id} onSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {inspection.observations?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t("no_observations_recorded_yet", "No observations recorded yet.")}</div>
              ) : (
                inspection.observations?.map((obs: any) => (
                  <div key={obs.id} className="border border-border/50 p-4 rounded-lg bg-background">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm">{obs.description}</p>
                      <SeverityChip severity={obs.severity} />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-3">
                      {obs.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {obs.location}</span>}
                      {obs.violation_id && (
                        <Link to="/violations/$id" params={{ id: obs.violation_id as string }} className="text-blue-500 hover:underline">{t("view_triggered_violation", "View Triggered Violation")}</Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>{t("summary", "Summary")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("total_observations", "Total Observations")}</p>
              <p className="text-2xl font-bold">{inspection.observations?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("high_critical_severity", "High/Critical Severity")}</p>
              <p className="text-2xl font-bold text-comet-down">
                {inspection.observations?.filter((o: any) => o.severity === 'high' || o.severity === 'critical').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {analysisResult && (
          <div className="md:col-span-3">
             <AnomalyResultCard analysis={analysisResult} />
          </div>
        )}
      </div>
    </div>
  );
}
