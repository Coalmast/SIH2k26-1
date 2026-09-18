import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2 } from 'lucide-react';
import { DatePicker } from '@/components/date-picker';
import { ReportHistory } from './ReportHistory';
import { ReportPreviewPanel, ReportType, ReportState } from './ReportPreviewPanel';
import { useReportSignatureStore } from '@/stores/report-store';

// Mock data builder for demonstration
const buildMockData = (type: ReportType, mineId: string) => {
  if (type === 'ec') {
    return {
      mineName: mineId === 'rajmahal' ? 'Rajmahal OCP' : 'Sonepur Bazari',
      ownerCompany: mineId === 'rajmahal' ? 'Eastern Coalfields Limited (ECL)' : 'Western Coalfields Limited (WCL)',
      reportingPeriod: { start: 'Apr 01, 2026', end: 'Sep 30, 2026' },
      reportDate: 'Sep 16, 2026',
      environmentalClearanceNo: 'J-11011/14/2018-IA.II(M)',
      complianceStatus: [
        { condition: 'Dust suppression by water sprinklers on haul roads', status: '⚠ Partially Complied', remarks: 'PM10 recorded 4.2 mg/m³ (limit 3.0). Sprinkler frequency increased.' },
        { condition: 'Plantation of 300 trees in green belt area', status: '✓ Complied', remarks: '312 trees planted as of June 2026.' },
        { condition: 'Mine drainage water discharge pH (6.0–8.5)', status: '✓ Complied', remarks: 'pH 7.2 — within limits.' },
        { condition: 'SPM limit at mine boundary (600 μg/m³)', status: '⚠ Partially Complied', remarks: 'SPM 720 μg/m³ recorded on Sept 14. Corrective action initiated.' },
        { condition: 'Submission of half-yearly EC compliance report', status: '✓ Complied', remarks: 'Submitted as per schedule.' },
        { condition: 'SO2 emission within permissible limits (2 ppm)', status: '✗ Not Complied', remarks: 'SO2 at 2.8 ppm on Sept 16 inspection. Show-cause response pending.' },
      ],
      managerName: 'Rajesh Kumar',
    };
  }

  return {
    mineName: mineId === 'rajmahal' ? 'Rajmahal OCP' : 'Sonepur Bazari',
    ownerCompany: mineId === 'rajmahal' ? 'Eastern Coalfields Limited' : 'Western Coalfields Limited',
    reportingPeriod: { start: 'Jan 01, 2026', end: 'Jan 07, 2026' },
    reportDate: 'Jan 07, 2026',
    meetingDate: 'Jan 05, 2026',
    meetingTime: '10:00 AM',
    location: 'Conference Room A',
    totalProductionMT: 45200,
    totalWorkers: 1250,
    accidents: type === 'form4b' ? [] : { fatal: 0, serious: 0 },
    ventilationSurveys: 2,
    safetyCommitteeMeetings: 1,
    attendees: ['Suresh Patel', 'Ravi Kumar', 'Amit Singh'],
    agendaItems: [
      { topic: 'Ventilation', discussion: 'Airflow in Panel A', actionItem: 'Increase fan speed', responsible: 'Amit Singh' }
    ],
    productionItems: [
      { mineral: 'Coal', quantityMT: 1500, remarks: 'Normal production' }
    ],
    casualties: [],
    environmentalClearanceNo: 'EC-12345/2026',
    complianceStatus: [
      { condition: 'Dust suppression', status: 'Complied', remarks: 'Sprinklers active' }
    ],
    contractorName: 'ABC Mining Services',
    principalEmployer: mineId === 'rajmahal' ? 'Eastern Coalfields Limited' : 'Western Coalfields Limited',
    totalContractWorkers: 450,
    wagesPaid: 1500000,
    managerName: 'Suresh Patel',
    accidentDate: 'Jan 06, 2026',
    accidentTime: '14:30',
    locationDetails: 'Haul Road B',
    description: 'Dumper minor collision',
    reportingYear: '2026',
  };
};

export function ReportGenerator() {
  const { t } = useTranslation();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [mineId, setMineId] = useState('rajmahal');
  const [reportType, setReportType] = useState<ReportType>('form3');
  const [status, setStatus] = useState<ReportState>('IDLE');
  const [reportData, setReportData] = useState<any>(null);

  const { signatureDataUrl, signedAt, managerName, clearSignature } = useReportSignatureStore();

  const handleGenerate = () => {
    if (!reportType) return;
    setStatus('GENERATING');
    clearSignature();
    // In reality, this would hit the backend to fetch data
    setReportData(buildMockData(reportType, mineId));
  };

  const handleSign = (data: { signatureDataUrl: string; signedAt: string; managerName: string }) => {
    useReportSignatureStore.getState().setSignature(data);
  };

  const handleSubmit = () => {
    setStatus('SUBMITTED');
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("statutory_report_generator", "Statutory Report Generator")}</h1>
          <p className="text-muted-foreground">
            {t("generate_review_and_digitally_", "Generate, review, and digitally sign official documents")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
        {/* Left Column: Configuration & History */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>{t("configuration", "Configuration")}</CardTitle>
              <CardDescription>{t("select_report_parameters", "Select report parameters")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("report_type", "Report Type")}</label>
                <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="form3">{t("annual_return_cmr_form_3", "Annual Return (CMR Form 3)")}</SelectItem>
                    <SelectItem value="form4a">{t("accident_notice_cmr_form_4_a", "Accident Notice (CMR Form 4-A)")}</SelectItem>
                    <SelectItem value="form4b">Accident Register (CMR Form 4-B)</SelectItem>
                    <SelectItem value="safety">Monthly Safety Committee Minutes</SelectItem>
                    <SelectItem value="ec">Half-Yearly EC Compliance Report</SelectItem>
                    <SelectItem value="cco">Production Return (CCO Form I)</SelectItem>
                    <SelectItem value="clra">Contractor Register (CLRA Form XII)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("mine_location", "Mine Location")}</label>
                <Select value={mineId} onValueChange={setMineId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rajmahal">{t("rajmahal_ocp", "Rajmahal OCP")}</SelectItem>
                    <SelectItem value="sonepur">{t("sonepur_bazari", "Sonepur Bazari")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium">{t("reporting_period", "Reporting Period")}</label>
                <DatePicker selected={date} onSelect={setDate} />
              </div>

              <Button 
                className="w-full gap-2 mt-2 bg-primary text-primary-foreground" 
                onClick={handleGenerate}
                disabled={!reportType || status === 'GENERATING'}
              >
                <Wand2 className="h-4 w-4" />
                {t("auto_populate_from_system", "Auto-populate from System")}
              </Button>
            </CardContent>
          </Card>

          <div className="flex-1 min-h-0">
            <ReportHistory mineId={mineId} />
          </div>
        </div>

        {/* Right Column: PDF Preview */}
        <div className="col-span-1 md:col-span-8 h-full">
          <ReportPreviewPanel 
            reportType={reportType}
            reportData={reportData}
            status={status}
            onStatusChange={setStatus}
            onSign={handleSign}
            onSubmit={handleSubmit}
            signedData={signatureDataUrl && signedAt && managerName ? { signatureDataUrl, signedAt, managerName } : undefined}
            hash="0x4b7f9a21e6435c2" // Mock hash for SUBMITTED state
          />
        </div>
      </div>
    </div>
  );
}
