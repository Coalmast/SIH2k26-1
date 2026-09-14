import { useTranslation } from "react-i18next";
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { SeverityChip } from '@/components/shared/SeverityChip';

export function AnomalyResultCard({ analysis }: { analysis: any }) {
  const {
    t
  } = useTranslation();

  if (!analysis) return null;

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-comet-down bg-[#f6465d]/15 border-[#f6465d]/30';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-amber-600 bg-amber-100 border-amber-200';
      default: return 'text-green-600 bg-green-100 border-green-200';
    }
  };

  const getRiskTextColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-comet-down';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-amber-600';
      default: return 'text-green-600';
    }
  };

  return (
    <Card className={`border-2 ${getRiskColor(analysis.risk_level)}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />{t("ai_anomaly_analysis", "AI Anomaly Analysis")}</CardTitle>
          <div className="text-right">
            <div className={`text-2xl font-black ${getRiskTextColor(analysis.risk_level)}`}>
              {analysis.risk_score}{t("100", "/ 100")}</div>
            <div className={`text-xs font-bold uppercase tracking-wider ${getRiskTextColor(analysis.risk_level)}`}>
              {analysis.risk_level}{t("risk", "RISK")}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="font-medium text-sm mb-3">
          {analysis.total_anomalies}{t("anomalies_detected", "Anomalies Detected")}</div>
        
        <div className="space-y-3">
          {analysis.anomalies?.map((anomaly: any, i: number) => (
            <div key={i} className="bg-background rounded-md p-3 border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className={`h-4 w-4 ${getRiskTextColor(anomaly.severity)}`} />
                  <span className="font-bold text-sm capitalize">{anomaly.type.replace(/_/g, ' ')}</span>
                </div>
                <SeverityChip severity={anomaly.severity} />
              </div>
              <p className="text-sm text-foreground/80 mb-2">{anomaly.message}</p>
              
              <div className="text-xs space-y-1">
                {anomaly.regulation_ref && (
                  <div className="flex text-muted-foreground">
                    <span className="font-semibold w-24">{t("regulation", "Regulation:")}</span>
                    <span>{anomaly.regulation_ref}</span>
                  </div>
                )}
                {anomaly.recommended_action && (
                  <div className="flex text-blue-600 bg-blue-50 p-1.5 rounded mt-2">
                    <Info className="h-3.5 w-3.5 mr-1.5 mt-0.5 shrink-0" />
                    <span>{anomaly.recommended_action}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {analysis.anomalies?.length === 0 && (
             <div className="text-center p-4 text-green-600 bg-green-50 rounded border border-green-100">{t(
               "no_anomalies_detected_operatio",
               "No anomalies detected. Operations normal."
             )}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
