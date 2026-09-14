import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { useScheduleInspection, useSubmitInspection, useAnalyzeInspection } from '../hooks/useInspections';
import { AddObservationForm } from './AddObservationForm';
import { AnomalyResultCard } from './AnomalyResultCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, CheckCircle2, Navigation, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { InspectionReportCard } from './InspectionReportCard';

export function MobileInspectionSimulator() {
  const {
    t
  } = useTranslation();

  const schedule = useScheduleInspection();
  const submit = useSubmitInspection();
  const analyze = useAnalyzeInspection();
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const [mines, setMines] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

  const [formData, setFormData] = useState({
    mine_id: '',
    checklist_template_id: '',
    inspection_type: 'environmental_pcb',
    zone: 'Pit 3 East — Gas Monitoring Zone',
  });

  useEffect(() => {
    async function loadMetadata() {
      const [minesRes, templatesRes] = await Promise.all([
        supabase.from('mines').select('id, name').limit(10),
        supabase.from('checklist_templates').select('id, name, inspection_type').limit(10)
      ]);
      
      if (minesRes.data) {
        setMines(minesRes.data);
        if (minesRes.data.length > 0) setFormData(f => ({...f, mine_id: minesRes.data[0].id}));
      }
      
      if (templatesRes.data) {
        setTemplates(templatesRes.data);
        if (templatesRes.data.length > 0) setFormData(f => ({...f, checklist_template_id: templatesRes.data[0].id}));
      }
      setIsLoadingMetadata(false);
    }
    loadMetadata();
  }, []);

  const handleStart = async () => {
    try {
      const result = await schedule.mutateAsync({
        ...formData,
        scheduled_date: new Date().toISOString().split('T')[0],
      } as any);
      if (result && result.id) {
         setActiveInspectionId(result.id);
      } else {
         alert("Inspection scheduled. Please check dashboard for ID.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnalyze = async () => {
    if (!activeInspectionId) return;
    try {
      const result = await analyze.mutateAsync(activeInspectionId);
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleComplete = async () => {
    if (!activeInspectionId) return;
    try {
      await submit.mutateAsync(activeInspectionId);
      setIsCompleted(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReset = () => {
    setActiveInspectionId(null);
    setAnalysisResult(null);
    setIsCompleted(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-muted/20 min-h-[80vh]">
      <div className="w-full max-w-[400px] bg-background border-[8px] border-slate-900 rounded-[3rem] shadow-2xl overflow-hidden aspect-[9/19] flex flex-col relative">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-7 bg-slate-900 rounded-b-3xl w-1/2 mx-auto z-10"></div>
        
        <div className="flex-1 overflow-y-auto p-4 pt-12 flex flex-col gap-4 relative">
          <div className="flex items-center gap-2 justify-center mb-4 text-primary">
            <Smartphone className="h-5 w-5" />
            <h2 className="font-bold">{t("inspector_app", "Inspector App")}</h2>
          </div>

          {isLoadingMetadata ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />{t("loading_config", "Loading Config...")}</div>
          ) : isCompleted && activeInspectionId ? (
            <div className="flex flex-col gap-4">
              <InspectionReportCard inspectionId={activeInspectionId} />
              <Button onClick={handleReset} variant="outline" className="w-full">{t("start_new_inspection", "Start New Inspection")}</Button>
            </div>
          ) : !activeInspectionId ? (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{t("start_inspection", "Start Inspection")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">{t("mine", "Mine")}</label>
                  <Select value={formData.mine_id} onValueChange={v => setFormData({...formData, mine_id: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Mine" />
                    </SelectTrigger>
                    <SelectContent>
                      {mines.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium">{t("template", "Template")}</label>
                  <Select value={formData.checklist_template_id} onValueChange={v => setFormData({...formData, checklist_template_id: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium">{t("zone", "Zone")}</label>
                  <Input 
                    value={formData.zone} 
                    onChange={e => setFormData({...formData, zone: e.target.value})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium">{t("type", "Type")}</label>
                  <Select value={formData.inspection_type} onValueChange={v => setFormData({...formData, inspection_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dgms_annual_general">{t("dgms_annual_general", "DGMS Annual General")}</SelectItem>
                      <SelectItem value="dgms_surprise">{t("dgms_surprise", "DGMS Surprise")}</SelectItem>
                      <SelectItem value="internal_safety_committee">{t("internal_safety_committee", "Internal Safety Committee")}</SelectItem>
                      <SelectItem value="environmental_pcb">{t("environmental_pcb", "Environmental PCB")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleStart} disabled={schedule.isPending || !formData.mine_id || !formData.checklist_template_id} className="w-full mt-4">
                  <Navigation className="mr-2 h-4 w-4" />{t("start_route", "Start Route")}</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="bg-primary/10 text-primary p-3 rounded-lg text-center font-medium border border-primary/20">{t("inspection_active", "Inspection Active")}<div className="text-xs font-normal opacity-80 break-all">{activeInspectionId}</div>
              </div>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("record_observation", "Record Observation")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddObservationForm 
                    inspectionId={activeInspectionId} 
                    onSuccess={() => {}}
                  />
                </CardContent>
              </Card>

              {analysisResult ? (
                <div className="mt-4 mb-4">
                  <AnomalyResultCard analysis={analysisResult} />
                </div>
              ) : (
                <Button onClick={handleAnalyze} disabled={analyze.isPending} variant="outline" className="w-full mt-4 border-primary text-primary">
                  {analyze.isPending ? "Analyzing..." : "Analyze Anomalies"}
                </Button>
              )}

              <Button onClick={handleComplete} disabled={submit.isPending} variant="secondary" className="w-full mt-auto bg-green-500 hover:bg-green-600 text-white">
                <CheckCircle2 className="mr-2 h-4 w-4" />{t("finish_inspection", "Finish Inspection")}</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
