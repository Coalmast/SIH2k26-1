import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ViolationTimeline } from '@/components/shared/ViolationTimeline'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { MediaGallery } from '@/components/shared/MediaGallery'
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Calendar } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/corrective-actions/$id')({
  component: CAPADetailPage,
})

const MOCK_CAPA = {
  id: "CAPA-2026-081",
  status: "in_progress" as const,
  violationCategory: "Ventilation",
  description: "Rectify ventilation non-compliance at Return Airway Level 3. Airflow below prescribed limit.",
  assignedTo: "Rajesh Kumar (Mine Manager)",
  dueDate: "2026-09-20",
  completedAt: null,
  completionNotes: "",
  preventiveMeasures: "Install auxiliary fan and seal leakages in stoppings.",
  evidences: [
    { type: "image", url: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80" },
    { type: "image", url: "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800&q=80" }
  ] as { type: "image"|"video"|"audio", url: string }[]
}

function CAPADetailPage() {
  const { id } = Route.useParams()
  const [capa, setCapa] = useState(MOCK_CAPA)
  const [notes, setNotes] = useState("")

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.png'], 'application/pdf': ['.pdf'] },
    onDrop: (acceptedFiles) => {
      // Mock upload
      console.log("Uploaded", acceptedFiles)
    }
  })

  const handleVerify = () => {
    setCapa(prev => ({ ...prev, status: "closed", completedAt: new Date().toISOString() as any }))
  }

  return (
    <>
      <Header fixed />
      
      <Main className='flex flex-1 flex-col p-6 bg-slate-50/50 min-h-screen'>
        <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">CAPA: {id}</h1>
                <Badge variant={capa.status === 'closed' ? 'default' : 'secondary'} className={capa.status === 'closed' ? 'bg-emerald-500' : ''}>
                  {capa.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-slate-500 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Linked to Violation: {capa.violationCategory}
              </p>
            </div>
            
            <div className="flex gap-3">
              {capa.status !== 'closed' && (
                <Button onClick={handleVerify} className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify & Close
                </Button>
              )}
            </div>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <ViolationTimeline currentStep={capa.status} className="my-4 max-w-3xl mx-auto" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Corrective Action Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-slate-700">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">Description</h4>
                    <p>{capa.description}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">Preventive Measures</h4>
                    <p>{capa.preventiveMeasures}</p>
                  </div>
                  
                  {capa.status !== 'closed' && (
                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">Completion Notes</h4>
                      <Textarea 
                        placeholder="Enter details about how the issue was resolved..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Evidences</CardTitle>
                  <CardDescription>Photos, videos, or documents proving completion.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {capa.evidences.length > 0 ? (
                    <MediaGallery media={capa.evidences} />
                  ) : (
                    <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed text-slate-500">
                      No evidences uploaded yet.
                    </div>
                  )}

                  {capa.status !== 'closed' && (
                    <div 
                      {...getRootProps()} 
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <UploadCloud className="h-10 w-10 mx-auto text-slate-400 mb-4" />
                      <p className="font-medium">Drag & drop files here to upload</p>
                      <p className="text-xs text-slate-500 mt-2">Supports Image, Video, PDF</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            <div className="space-y-6">
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Assignment Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Assigned To</p>
                      <p className="text-sm text-slate-500">{capa.assignedTo}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-50 p-2 rounded-full border border-amber-100">
                      <Calendar className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Due Date</p>
                      <p className="text-sm text-amber-600 font-medium">{capa.dueDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </Main>
    </>
  )
}
