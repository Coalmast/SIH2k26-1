import { useTranslation } from "react-i18next";
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScanText, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Copy } from 'lucide-react'
import { useOCR } from '../contractors/hooks/useOCR'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export function OCRModule() {
  const {
    t
  } = useTranslation();

  const [file, setFile] = useState<File | null>(null)
  const { result: ocrResult, uploadAndOCR, reset: resetOCR } = useOCR()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleScan = () => {
    if (!file) return
    uploadAndOCR(file)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/30 max-w-[1200px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ScanText className="h-8 w-8 text-primary" />{t("ai_document_ocr", "AI Document OCR")}</h1>
          <p className="text-muted-foreground mt-1">{t(
            "automatically_extract_and_vali",
            "Automatically extract and validate data from statutory forms, licenses, and handwritten reports."
          )}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm h-[500px] flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg">{t("upload_document", "Upload Document")}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
            {!file ? (
              <div 
                className="w-full h-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="h-12 w-12 text-muted-foreground/70 mb-4" />
                <div className="text-sm font-semibold text-foreground/80">{t("drag_drop_your_document_here", "Drag & drop your document here")}</div>
                <div className="text-xs text-muted-foreground mt-1">{t("pdf_jpg_png_up_to_10mb", "PDF, JPG, PNG up to 10MB")}</div>
                <input id="file-upload" type="file" className="hidden" onChange={e => e.target.files && setFile(e.target.files[0])} accept=".pdf,image/*" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                <FileText className="h-20 w-20 text-primary" />
                <div className="text-center">
                  <div className="font-semibold text-foreground">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)}{t("mb", "MB")}</div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => {setFile(null); resetOCR();}}>{t("change_file", "Change File")}</Button>
                  <Button onClick={handleScan} disabled={ocrResult.status !== 'idle' && ocrResult.status !== 'error'}>
                    {['uploading', 'scanning'].includes(ocrResult.status) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ScanText className="h-4 w-4 mr-2" />}
                    {['uploading', 'scanning'].includes(ocrResult.status) ? 'Extracting via OCR API...' : 'Start Extraction'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm h-[500px] flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg flex justify-between items-center">
              {t("extraction_results", "Extraction Results")}
              {ocrResult.status === 'verified' && ocrResult.confidence && <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">{(ocrResult.confidence * 100).toFixed(0)}% Confidence</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col relative">
            {ocrResult.status === 'idle' && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <ScanText className="h-12 w-12 text-slate-200 mb-4" />
                <p>{t(
                  "upload_a_document_and_start_ex",
                  "Upload a document and start extraction to see the raw text here."
                )}</p>
              </div>
            )}
            
            {['uploading', 'scanning'].includes(ocrResult.status) && (
              <div className="h-full p-6 space-y-6">
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </div>
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </div>
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-24 bg-muted rounded w-full"></div>
                </div>
              </div>
            )}

            {ocrResult.status === 'error' && (
              <div className="h-full p-6 flex flex-col items-center justify-center text-center">
                 <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                 <p className="text-destructive font-medium">{ocrResult.error}</p>
              </div>
            )}

            {ocrResult.status === 'verified' && ocrResult.rawText && (
              <div className="p-6 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 mb-4 flex-shrink-0">
                  <Label className="text-primary font-bold text-xs uppercase">Raw Text Extracted</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Powered by OCR.space Free Tier API
                  </p>
                </div>
                
                <div className="relative flex-1 group min-h-0 overflow-y-auto rounded-lg border border-border/50">
                  <pre className="bg-background p-4 text-sm font-mono text-foreground/80 whitespace-pre-wrap min-h-full">
                    {ocrResult.rawText}
                  </pre>
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(ocrResult.rawText!);
                        setCopiedField('raw');
                        setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-muted/80 backdrop-blur-sm rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    {copiedField === 'raw' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
