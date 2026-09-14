import { useTranslation } from "react-i18next";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileSignature, Download, FileText, CheckCircle2, History, Wand2 } from 'lucide-react';
import { DatePicker } from '@/components/date-picker';
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

const MOCK_HISTORY = [
  {
    id: 'rep-1',
    type: 'Form 3 - Annual Return',
    date: '01 Feb 2027',
    status: 'SUBMITTED',
    hash: '0x4b7f...9a21'
  },
  {
    id: 'rep-2',
    type: 'Monthly Safety Committee Minutes',
    date: '15 Jan 2027',
    status: 'SUBMITTED',
    hash: '0x8c2a...1f44'
  },
  {
    id: 'rep-3',
    type: 'Accident Notice (Form 4-A)',
    date: '10 Dec 2026',
    status: 'SUBMITTED',
    hash: '0x9a3b...7d22'
  }
];

export function ReportGenerator() {
  const {
    t
  } = useTranslation();

  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("statutory_report_generator", "Statutory Report Generator")}</h1>
          <p className="text-muted-foreground">{t(
            "generate_review_and_digitally_",
            "Generate, review, and digitally sign official documents"
          )}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        {/* Left Column: Configuration & History */}
        <div className="col-span-4 flex flex-col gap-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>{t("configuration", "Configuration")}</CardTitle>
              <CardDescription>{t("select_report_parameters", "Select report parameters")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("report_type", "Report Type")}</label>
                <Select defaultValue="form3">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="form3">{t("annual_return_cmr_form_3", "Annual Return (CMR Form 3)")}</SelectItem>
                    <SelectItem value="form4a">{t("accident_notice_cmr_form_4_a", "Accident Notice (CMR Form 4-A)")}</SelectItem>
                    <SelectItem value="safety_mins">{t("monthly_safety_committee_minut", "Monthly Safety Committee Minutes")}</SelectItem>
                    <SelectItem value="ec_half">{t("half_yearly_ec_compliance_repo", "Half-Yearly EC Compliance Report")}</SelectItem>
                    <SelectItem value="form1">{t("production_return_cco_form_i", "Production Return (CCO Form I)")}</SelectItem>
                    <SelectItem value="form12">{t(
                      "contractor_register_summary_cl",
                      "Contractor Register Summary (CLRA Form XII)"
                    )}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("mine_location", "Mine Location")}</label>
                <Select defaultValue="rajmahal">
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

              <Button className="w-full gap-2 mt-2" variant="default">
                <Wand2 className="h-4 w-4" />{t("auto_populate_from_system", "Auto-populate from System")}</Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />{t("history", "History")}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-6 pb-6">
                <div className="flex flex-col gap-3">
                  {MOCK_HISTORY.map((report) => (
                    <div key={report.id} className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/50 p-3">
                      <div className="flex items-start justify-between">
                        <span className="font-medium text-sm leading-tight">{report.type}</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                          {report.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{report.date}</span>
                        <span className="font-mono">{report.hash}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="w-full mt-1 h-7 text-xs gap-2">
                        <Download className="h-3 w-3" />{t("download_pdf", "Download PDF")}</Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: PDF Preview */}
        <div className="col-span-8 flex flex-col">
          <Card className="border-border/50 bg-card/50 h-full flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20 py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />{t("live_preview", "Live Preview")}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileSignature className="h-4 w-4" />{t("digital_sign", "Digital Sign")}</Button>
                <Button size="sm" className="bg-[#FCD535] text-black hover:bg-[#FCD535]/90 gap-2">
                  <CheckCircle2 className="h-4 w-4" />{t("submit_report", "Submit Report")}</Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 bg-[#0B0E11] relative flex items-center justify-center">
              {/* Mock PDF Container */}
              <div className="w-[80%] h-[90%] bg-background rounded shadow-2xl p-12 text-black overflow-y-auto">
                <div className="max-w-2xl mx-auto flex flex-col gap-8">
                  <div className="text-center border-b pb-4 border-gray-200">
                    <h2 className="text-2xl font-bold uppercase font-serif tracking-wide">{t("form_iii", "Form III")}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t("annual_return_under_cmr_2017", "Annual Return under CMR 2017")}</p>
                  </div>
                  
                  <div className="space-y-6 font-serif text-sm">
                    <div className="flex gap-4 border-b border-dashed border-gray-200 pb-2">
                      <span className="font-semibold w-48">{t("1_name_of_the_mine", "1. Name of the Mine:")}</span>
                      <span className="bg-yellow-200/50 px-1 rounded flex-1">{t("rajmahal_ocp", "Rajmahal OCP")}</span>
                    </div>
                    <div className="flex gap-4 border-b border-dashed border-gray-200 pb-2">
                      <span className="font-semibold w-48">{t("2_owner_company", "2. Owner / Company:")}</span>
                      <span className="bg-yellow-200/50 px-1 rounded flex-1">{t("eastern_coalfields_limited", "Eastern Coalfields Limited")}</span>
                    </div>
                    <div className="flex gap-4 border-b border-dashed border-gray-200 pb-2">
                      <span className="font-semibold w-48">{t("3_reporting_period", "3. Reporting Period:")}</span>
                      <span className="bg-yellow-200/50 px-1 rounded flex-1">{t("jan_01_2027_jan_07_2027", "Jan 01, 2027 - Jan 07, 2027")}</span>
                    </div>
                    <div className="flex gap-4 border-b border-dashed border-gray-200 pb-2">
                      <span className="font-semibold w-48">{t("4_total_production_mt", "4. Total Production (MT):")}</span>
                      <span className="bg-yellow-200/50 px-1 rounded flex-1">{t("45_200_mt", "45,200 MT")}</span>
                    </div>
                    
                    <div className="pt-8">
                      <p className="text-gray-500 italic text-center">{t(
                        "data_auto_populated_from_produ",
                        "... Data auto-populated from production logs and compliance metrics ..."
                      )}</p>
                    </div>

                    <div className="pt-16 flex justify-between">
                      <div className="text-center">
                        <div className="w-32 border-b border-gray-400 mb-2"></div>
                        <p className="text-xs">{t("manager_signature", "Manager Signature")}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-32 border-b border-gray-400 mb-2"></div>
                        <p className="text-xs">{t("date", "Date")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
