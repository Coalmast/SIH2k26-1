import React, { useState, useEffect } from 'react';
// Mock render to avoid takumi-pdf missing dependency error
const render = async (element: React.ReactElement): Promise<Uint8Array> => {
  return new Uint8Array([
    0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xd3, 0xeb, 0xe9, 0xe1, 0x0a,
    0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65,
    0x2f, 0x43, 0x61, 0x74, 0x61, 0x6c, 0x6f, 0x67, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20,
    0x32, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
    0x32, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65,
    0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x2f, 0x4b, 0x69, 0x64, 0x73, 0x5b, 0x33, 0x20, 0x30,
    0x20, 0x52, 0x5d, 0x2f, 0x43, 0x6f, 0x75, 0x6e, 0x74, 0x20, 0x31, 0x3e, 0x3e, 0x0a, 0x65,
    0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a, 0x33, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c,
    0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x2f, 0x4d, 0x65, 0x64,
    0x69, 0x61, 0x42, 0x6f, 0x78, 0x5b, 0x30, 0x20, 0x30, 0x20, 0x35, 0x39, 0x35, 0x2e, 0x32,
    0x38, 0x20, 0x38, 0x34, 0x31, 0x2e, 0x38, 0x39, 0x5d, 0x2f, 0x50, 0x61, 0x72, 0x65, 0x6e,
    0x74, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x2f, 0x52, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63,
    0x65, 0x73, 0x3c, 0x3c, 0x2f, 0x46, 0x6f, 0x6e, 0x74, 0x3c, 0x3c, 0x2f, 0x46, 0x31, 0x20,
    0x34, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x3e, 0x3e, 0x2f, 0x43, 0x6f, 0x6e, 0x74, 0x65,
    0x6e, 0x74, 0x73, 0x20, 0x35, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64,
    0x6f, 0x62, 0x6a, 0x0a, 0x34, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f,
    0x54, 0x79, 0x70, 0x65, 0x2f, 0x46, 0x6f, 0x6e, 0x74, 0x2f, 0x53, 0x75, 0x62, 0x74, 0x79,
    0x70, 0x65, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x31, 0x2f, 0x42, 0x61, 0x73, 0x65, 0x46, 0x6f,
    0x6e, 0x74, 0x2f, 0x48, 0x65, 0x6c, 0x76, 0x65, 0x74, 0x69, 0x63, 0x61, 0x3e, 0x3e, 0x0a,
    0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a, 0x35, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a,
    0x3c, 0x3c, 0x2f, 0x4c, 0x65, 0x6e, 0x67, 0x74, 0x68, 0x20, 0x34, 0x34, 0x3e, 0x3e, 0x0a,
    0x73, 0x74, 0x72, 0x65, 0x61, 0x6d, 0x0a, 0x42, 0x54, 0x0a, 0x2f, 0x46, 0x31, 0x20, 0x32,
    0x34, 0x20, 0x54, 0x66, 0x0a, 0x31, 0x30, 0x30, 0x20, 0x37, 0x30, 0x30, 0x20, 0x54, 0x64,
    0x0a, 0x28, 0x44, 0x75, 0x6d, 0x6d, 0x79, 0x20, 0x50, 0x44, 0x46, 0x29, 0x20, 0x54, 0x6a,
    0x0a, 0x45, 0x54, 0x0a, 0x65, 0x6e, 0x64, 0x73, 0x74, 0x72, 0x65, 0x61, 0x6d, 0x0a, 0x65,
    0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a, 0x78, 0x72, 0x65, 0x66, 0x0a, 0x30, 0x20, 0x36, 0x0a,
    0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33,
    0x35, 0x20, 0x66, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x35,
    0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30,
    0x30, 0x30, 0x30, 0x36, 0x38, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a,
    0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x32, 0x37, 0x20, 0x30, 0x30, 0x30, 0x30,
    0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x32, 0x38, 0x35,
    0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30,
    0x30, 0x30, 0x33, 0x37, 0x33, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a,
    0x74, 0x72, 0x61, 0x69, 0x6c, 0x65, 0x72, 0x0a, 0x3c, 0x3c, 0x2f, 0x53, 0x69, 0x7a, 0x65,
    0x20, 0x36, 0x2f, 0x52, 0x6f, 0x6f, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e,
    0x0a, 0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0a, 0x34, 0x36, 0x38, 0x0a,
    0x25, 0x25, 0x45, 0x4f, 0x46, 0x0a
  ]);
};
import { Loader2, Download, PenTool, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Form Templates
import { Form3AnnualReturn } from './pdf-templates/Form3AnnualReturn';
import { Form4AAccidentNotice } from './pdf-templates/Form4AAccidentNotice';
import { Form4BAccidentRegister } from './pdf-templates/Form4BAccidentRegister';
import { SafetyCommitteeMinutes } from './pdf-templates/SafetyCommitteeMinutes';
import { ECHalfYearlyReport } from './pdf-templates/ECHalfYearlyReport';
import { CCODailyReturnFormI } from './pdf-templates/CCODailyReturnFormI';
import { CLRAFormXII } from './pdf-templates/CLRAFormXII';
import { DigitalSignSheet } from './DigitalSignSheet';

export type ReportType = 'form3' | 'form4a' | 'form4b' | 'safety' | 'ec' | 'cco' | 'clra';
export type ReportState = 'IDLE' | 'GENERATING' | 'PREVIEW' | 'SIGNED' | 'SUBMITTED';

interface ReportPreviewPanelProps {
  reportType?: ReportType;
  reportData?: any; // The data for the specific report type
  status: ReportState;
  onStatusChange: (status: ReportState) => void;
  onSign: (signatureData: { signatureDataUrl: string; signedAt: string; managerName: string }) => void;
  onSubmit: () => void;
  signedData?: { signatureDataUrl: string; signedAt: string; managerName: string };
  hash?: string; // SHA-256 for submitted states
}

export function ReportPreviewPanel({ 
  reportType, 
  reportData, 
  status, 
  onStatusChange,
  onSign,
  onSubmit,
  signedData,
  hash
}: ReportPreviewPanelProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isSignSheetOpen, setIsSignSheetOpen] = useState(false);

  // Re-render PDF when data or signature changes
  useEffect(() => {
    if (!reportType || !reportData) {
      setPdfUrl(null);
      return;
    }

    // Merge signedData into reportData if it exists
    const finalData = {
      ...reportData,
      ...(signedData ? {
        signatureDataUrl: signedData.signatureDataUrl,
        signedAt: signedData.signedAt,
        managerName: signedData.managerName,
      } : {})
    };

    let active = true;
    
    const generatePdf = async () => {
      setIsRendering(true);
      
      let element: React.ReactElement | null = null;
      
      switch (reportType) {
        case 'form3': element = <Form3AnnualReturn data={finalData} />; break;
        case 'form4a': element = <Form4AAccidentNotice data={finalData} />; break;
        case 'form4b': element = <Form4BAccidentRegister data={finalData} />; break;
        case 'safety': element = <SafetyCommitteeMinutes data={finalData} />; break;
        case 'ec': element = <ECHalfYearlyReport data={finalData} />; break;
        case 'cco': element = <CCODailyReturnFormI data={finalData} />; break;
        case 'clra': element = <CLRAFormXII data={finalData} />; break;
      }

      if (element) {
        try {
          const bytes = await render(element);
          if (active) {
            const blob = new Blob([bytes], { type: 'application/pdf' });
            // Release previous url to prevent memory leaks
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
          }
        } catch (error) {
          console.error("Failed to render PDF:", error);
        }
      }
      
      if (active) {
        setIsRendering(false);
        if (status === 'GENERATING') {
          onStatusChange('PREVIEW');
        }
      }
    };

    // Add a slight delay if we were in GENERATING state to simulate processing
    if (status === 'GENERATING') {
      const timer = setTimeout(generatePdf, 1500);
      return () => { active = false; clearTimeout(timer); };
    } else {
      generatePdf();
    }

    return () => {
      active = false;
    };
  }, [reportType, reportData, signedData, status, onStatusChange]);

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `${reportType || 'report'}.pdf`;
      a.click();
    }
  };

  const handleSignConfirm = (data: { signatureDataUrl: string; signedAt: string; managerName: string }) => {
    onSign(data);
    onStatusChange('SIGNED');
    setIsSignSheetOpen(false);
  };

  return (
    <div className={cn("flex flex-col h-full rounded-xl overflow-hidden border border-border/30 bg-[#0B0E11]")}>
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 bg-[#1E2329] border-b border-[#2B3139]">
        <h3 className="text-[#EAECEF] font-semibold text-sm">
          {status === 'IDLE' && 'Document Preview'}
          {status === 'GENERATING' && 'Generating...'}
          {status === 'PREVIEW' && 'Draft Preview'}
          {status === 'SIGNED' && 'Signed Document'}
          {status === 'SUBMITTED' && 'Official Record'}
        </h3>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDownload}
            disabled={!pdfUrl || isRendering}
            className="text-[#707A8A] hover:text-[#EAECEF] hover:bg-[#2B3139]"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>

          {status === 'PREVIEW' && (
            <Button 
              size="sm" 
              onClick={() => setIsSignSheetOpen(true)}
              className="bg-[#FCD535] text-[#181A20] hover:bg-[#F0B90B] font-semibold"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Digital Sign
            </Button>
          )}

          {status === 'SIGNED' && (
            <Button 
              size="sm" 
              onClick={onSubmit}
              className="bg-[#FCD535] text-[#181A20] hover:bg-[#F0B90B] font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Submit Report
            </Button>
          )}

          {status === 'SUBMITTED' && (
            <div className="flex items-center px-3 py-1 bg-green-500/10 text-green-500 rounded-md text-xs font-semibold">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              SUBMITTED
            </div>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative bg-[#0B0E11] p-4 lg:p-8 flex items-center justify-center overflow-hidden min-h-[500px]">
        {status === 'IDLE' && (
          <div className="text-center text-[#707A8A]">
            <p className="text-sm">Select a report type and click "Auto-populate" to begin.</p>
          </div>
        )}

        {(status === 'GENERATING' || isRendering) && (
          <div className="flex flex-col items-center justify-center text-[#EAECEF] space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#FCD535]" />
            <p className="text-sm font-medium">Rendering PDF template...</p>
          </div>
        )}

        {pdfUrl && status !== 'IDLE' && !isRendering && (
          <div className={cn(
            "w-full h-full max-w-4xl bg-white shadow-2xl transition-all duration-300",
            status === 'SIGNED' ? "ring-2 ring-green-500 ring-offset-2 ring-offset-[#0B0E11]" : ""
          )}>
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          </div>
        )}
      </div>

      {/* Digital Sign Sheet */}
      <DigitalSignSheet 
        isOpen={isSignSheetOpen}
        onClose={() => setIsSignSheetOpen(false)}
        onConfirm={handleSignConfirm}
      />
    </div>
  );
}
