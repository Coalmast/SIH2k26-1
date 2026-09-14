import React, { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { CheckCircle2, ChevronLeft, Save, AlertTriangle } from 'lucide-react'
import { Link, useRouter } from '@tanstack/react-router'
import { Route } from '@/routes/_authenticated/ocr/review.$itemId'

interface ExtractedField {
  id: string
  label: string
  value: string
  confidence: number
}

const MOCK_FIELDS: ExtractedField[] = [
  { id: '1', label: 'Contractor Name', value: 'TechDrill Corp', confidence: 0.98 },
  { id: '2', label: 'Registration No.', value: 'REG-2023-8891', confidence: 0.95 },
  { id: '3', label: 'Validity Date', value: '2026-09-10', confidence: 0.82 },
  { id: '4', label: 'Authorized Person', value: 'S. Sharma', confidence: 0.76 },
  { id: '5', label: 'Worker Count Limit', value: '150', confidence: 0.99 },
]

export function OCRReviewScreen() {
  const { itemId } = Route.useParams()
  const router = useRouter()
  const [fields, setFields] = useState<ExtractedField[]>(MOCK_FIELDS)

  const handleFieldChange = (id: string, newValue: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, value: newValue, confidence: 1.0 } : f))
  }

  const handleApprove = () => {
    // In a real app, save to backend here
    router.navigate({ to: '/ocr' })
  }

  return (
    <>
      <Header fixed />
      <Main className="flex flex-1 flex-col p-6 bg-muted/30 min-h-screen">
        <div className="w-full max-w-7xl mx-auto space-y-4 animate-in fade-in duration-300">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/ocr">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Review Extraction</h1>
                <p className="text-sm text-muted-foreground">Document ID: {itemId}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline"><Save className="h-4 w-4 mr-2" /> Save Draft</Button>
              <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Approve & Sync to DB
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
            
            {/* PDF Viewer Side */}
            <Card className="h-full flex flex-col shadow-sm border-border">
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-sm font-medium">Original Document</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 relative bg-slate-200/50">
                {/* Mock PDF Viewer */}
                <div className="absolute inset-4 bg-background shadow rounded flex items-center justify-center border border-border text-muted-foreground/70 flex-col gap-4">
                  <div className="w-48 h-64 border-2 border-dashed border-border flex items-center justify-center text-xs">
                    PDF Page 1
                  </div>
                  <p>Document Preview</p>
                </div>
              </CardContent>
            </Card>

            {/* Extracted Fields Side */}
            <Card className="h-full flex flex-col shadow-sm border-border">
              <CardHeader className="py-3 px-4 border-b bg-muted/50">
                <CardTitle className="text-sm font-medium flex justify-between items-center">
                  <span>Extracted Data</span>
                  <Badge variant="outline" className="bg-[#0ecb81]/10 text-comet-up border-[#0ecb81]/30">
                    AI Confidence: 90%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                
                <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  Please review the fields below. Fields with lower confidence (yellow) may require manual correction. Editing a field marks it as 100% verified.
                </div>

                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor={field.id} className="text-foreground/80 font-semibold">{field.label}</Label>
                        <Badge 
                          variant={field.confidence >= 0.9 ? 'secondary' : 'outline'}
                          className={
                            field.confidence >= 0.9 ? 'bg-[#0ecb81]/15 text-comet-up' :
                            field.confidence >= 0.7 ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-[#f6465d]/15 text-comet-down border-[#f6465d]/30'
                          }
                        >
                          {(field.confidence * 100).toFixed(0)}% Match
                        </Badge>
                      </div>
                      <Input 
                        id={field.id}
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={`transition-colors ${field.confidence < 0.9 ? 'border-amber-300 focus-visible:ring-amber-500' : 'border-border'}`}
                      />
                    </div>
                  ))}
                </div>

              </CardContent>
            </Card>

          </div>
        </div>
      </Main>
    </>
  )
}
