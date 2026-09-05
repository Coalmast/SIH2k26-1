import React, { useState } from 'react';
import { useScheduleInspection, useSubmitInspection, useAnalyzeInspection } from '../hooks/useInspections';
import { AddObservationForm } from './AddObservationForm';
import { AnomalyResultCard } from './AnomalyResultCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, CheckCircle2, Navigation } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function MobileInspectionSimulator() {
  const schedule = useScheduleInspection();
  const submit = useSubmitInspection();
  const analyze = useAnalyzeInspection();
  const [activeInspectionId, setActiveInspectionId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    mine_id: '00000000-0000-0000-0000-000000000004',
    checklist_template_id: '00000000-0000-0000-0000-000000000020',
    inspection_type: 'environmental_pcb',
    zone: 'Zone A',
  });

  const handleStart = async () => {
    try {
      const result = await schedule.mutateAsync({
        ...formData,
        scheduled_date: new Date().toISOString().split('T')[0],
      } as any);
      // Assuming result returns the created inspection
      if (result && result.id) {
         setActiveInspectionId(result.id);
      } else {
         // Fallback if backend doesn't return full object immediately
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
      setActiveInspectionId(null);
      setAnalysisResult(null);
      alert('Inspection Completed successfully');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-muted/20 min-h-[80vh]">
      <div className="w-full max-w-[400px] bg-background border-[8px] border-slate-900 rounded-[3rem] shadow-2xl overflow-hidden aspect-[9/19] flex flex-col relative">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-7 bg-slate-900 rounded-b-3xl w-1/2 mx-auto z-10"></div>
        
        <div className="flex-1 overflow-y-auto p-4 pt-12 flex flex-col gap-4">
          <div className="flex items-center gap-2 justify-center mb-4 text-primary">
            <Smartphone className="h-5 w-5" />
            <h2 className="font-bold">Inspector App</h2>
          </div>

          {!activeInspectionId ? (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Start Inspection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Mine ID</label>
                  <Input 
                    placeholder="UUID of Mine" 
                    value={formData.mine_id} 
                    onChange={e => setFormData({...formData, mine_id: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Zone</label>
                  <Input 
                    value={formData.zone} 
                    onChange={e => setFormData({...formData, zone: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Template ID</label>
                  <Input 
                    placeholder="UUID of Template" 
                    value={formData.checklist_template_id} 
                    onChange={e => setFormData({...formData, checklist_template_id: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Type</label>
                  <Select value={formData.inspection_type} onValueChange={v => setFormData({...formData, inspection_type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dgms_annual_general">DGMS Annual General</SelectItem>
                      <SelectItem value="dgms_surprise">DGMS Surprise</SelectItem>
                      <SelectItem value="internal_safety_committee">Internal Safety Committee</SelectItem>
                      <SelectItem value="environmental_pcb">Environmental PCB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleStart} disabled={schedule.isPending} className="w-full mt-4">
                  <Navigation className="mr-2 h-4 w-4" /> Start Route
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="bg-primary/10 text-primary p-3 rounded-lg text-center font-medium border border-primary/20">
                Inspection Active
                <div className="text-xs font-normal opacity-80 break-all">{activeInspectionId}</div>
              </div>

              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Record Observation</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddObservationForm 
                    inspectionId={activeInspectionId} 
                    onSuccess={() => alert('Observation added')}
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
                <CheckCircle2 className="mr-2 h-4 w-4" /> Finish Inspection
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
