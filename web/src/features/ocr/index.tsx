import { useTranslation } from "react-i18next";
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScanText, UploadCloud, FileText, Check, AlertCircle, Loader2, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export function OCRModule() {
  const {
    t
  } = useTranslation();

  const [file, setFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleScan = () => {
    if (!file) return
    setIsScanning(true)
    setTimeout(() => {
      setResult({
        documentType: 'Statutory Clearance (Form 1A)',
        confidence: 0.94,
        extractedData: {
          licenseNumber: 'MP/2026/IND/8842',
          validUntil: '2027-12-31',
          contractorName: 'Vinay Earth Movers',
          approvedBy: 'DGMS Regional Head',
        }
      })
      setIsScanning(false)
    }, 2500)
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
                  <Button variant="outline" onClick={() => {setFile(null); setResult(null);}}>{t("change_file", "Change File")}</Button>
                  <Button onClick={handleScan} disabled={isScanning}>
                    {isScanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ScanText className="h-4 w-4 mr-2" />}
                    {isScanning ? 'Extracting via Gemini...' : 'Start Extraction'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm h-[500px] flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg flex justify-between items-center">{t("extraction_results", "Extraction Results")}{result && <Badge className="bg-comet-up hover:bg-emerald-600">{(result.confidence * 100).toFixed(0)}{t("confidence", "% Confidence")}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {!isScanning && !result && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <ScanText className="h-12 w-12 text-slate-200 mb-4" />
                <p>{t(
                  "upload_a_document_and_start_ex",
                  "Upload a document and start extraction to see the parsed data here."
                )}</p>
              </div>
            )}
            
            {isScanning && (
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
                  <div className="h-10 bg-muted rounded w-full"></div>
                </div>
              </div>
            )}

            {result && !isScanning && (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <Label className="text-primary font-bold text-xs uppercase">{t("detected_document_type", "Detected Document Type")}</Label>
                  <div className="text-lg font-semibold mt-1 text-foreground">{result.documentType}</div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lic">{t("license_form_number", "License / Form Number")}</Label>
                    <div className="relative">
                      <Input id="lic" defaultValue={result.extractedData.licenseNumber} />
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-comet-up" />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="contractor">{t("contractor_agency_name", "Contractor / Agency Name")}</Label>
                    <div className="relative">
                      <Input id="contractor" defaultValue={result.extractedData.contractorName} />
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-comet-up" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="date">{t("valid_until", "Valid Until")}</Label>
                    <div className="relative">
                      <Input id="date" defaultValue={result.extractedData.validUntil} />
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-comet-up" />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="auth">{t("approving_authority", "Approving Authority")}</Label>
                    <div className="relative">
                      <Input id="auth" defaultValue={result.extractedData.approvedBy} />
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                      <p className="text-[10px] text-amber-600 absolute -bottom-5">{t(
                        "low_confidence_please_verify_m",
                        "Low confidence. Please verify manually."
                      )}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full"><Save className="h-4 w-4 mr-2" />{t("save_verified_data", "Save Verified Data")}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
