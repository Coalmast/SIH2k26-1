import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScanText, UploadCloud, FileText, Check, AlertCircle, Loader2, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export function OCRModule() {
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
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 max-w-[1200px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ScanText className="h-8 w-8 text-primary" />
            AI Document OCR
          </h1>
          <p className="text-muted-foreground mt-1">Automatically extract and validate data from statutory forms, licenses, and handwritten reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm h-[500px] flex flex-col">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-lg">Upload Document</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
            {!file ? (
              <div 
                className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <UploadCloud className="h-12 w-12 text-slate-400 mb-4" />
                <div className="text-sm font-semibold text-slate-700">Drag & drop your document here</div>
                <div className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</div>
                <input id="file-upload" type="file" className="hidden" onChange={e => e.target.files && setFile(e.target.files[0])} accept=".pdf,image/*" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                <FileText className="h-20 w-20 text-primary" />
                <div className="text-center">
                  <div className="font-semibold text-slate-900">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => {setFile(null); setResult(null);}}>Change File</Button>
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
            <CardTitle className="text-lg flex justify-between items-center">
              Extraction Results
              {result && <Badge className="bg-emerald-500 hover:bg-emerald-600">{(result.confidence * 100).toFixed(0)}% Confidence</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {!isScanning && !result && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <ScanText className="h-12 w-12 text-slate-200 mb-4" />
                <p>Upload a document and start extraction to see the parsed data here.</p>
              </div>
            )}
            
            {isScanning && (
              <div className="h-full p-6 space-y-6">
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-10 bg-slate-100 rounded w-full"></div>
                </div>
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-10 bg-slate-100 rounded w-full"></div>
                </div>
                <div className="space-y-2 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-10 bg-slate-100 rounded w-full"></div>
                </div>
              </div>
            )}

            {result && !isScanning && (
              <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <Label className="text-primary font-bold text-xs uppercase">Detected Document Type</Label>
                  <div className="text-lg font-semibold mt-1 text-slate-900">{result.documentType}</div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lic">License / Form Number</Label>
                    <div className="relative">
                      <Input id="lic" defaultValue={result.extractedData.licenseNumber} />
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="contractor">Contractor / Agency Name</Label>
                    <div className="relative">
                      <Input id="contractor" defaultValue={result.extractedData.contractorName} />
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="date">Valid Until</Label>
                    <div className="relative">
                      <Input id="date" defaultValue={result.extractedData.validUntil} />
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="auth">Approving Authority</Label>
                    <div className="relative">
                      <Input id="auth" defaultValue={result.extractedData.approvedBy} />
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                      <p className="text-[10px] text-amber-600 absolute -bottom-5">Low confidence. Please verify manually.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full"><Save className="h-4 w-4 mr-2" /> Save Verified Data</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
