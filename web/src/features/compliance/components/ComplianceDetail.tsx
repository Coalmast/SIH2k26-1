import React, { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, UploadCloud, FileText, CheckCircle2, Clock, Calendar, FileType2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useComplianceInstances } from '@/features/compliance/hooks/useCompliance'
import { useAuthStore } from '@/stores/auth-store'

export function ComplianceDetail() {
  const { id } = useParams({ from: '/_authenticated/compliance/$id' })
  const { user } = useAuthStore()
  const { data: instances, isLoading } = useComplianceInstances(user?.mine_ids?.[0])
  const [file, setFile] = useState<File | null>(null)
  
  const instance = instances?.find((i: any) => i.id === id)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading...</div>
  if (!instance) return <div className="p-12 text-center text-muted-foreground">Compliance record not found.</div>

  const isOverdue = new Date(instance.due_date) < new Date() && instance.status !== 'approved'

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 max-w-[1000px] mx-auto w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/compliance">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {instance.requirement?.regulation?.code || 'REG-UNK'}
            </span>
            <Badge variant="outline" className="capitalize">{instance.status.replace('_', ' ')}</Badge>
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{instance.requirement?.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Requirement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                {instance.requirement?.description || 'No description provided.'}
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Due Date</div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className={isOverdue ? 'text-red-500 font-bold' : ''}>
                      {new Date(instance.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold uppercase mb-1">Frequency</div>
                  <div className="text-sm font-medium capitalize">
                    {instance.requirement?.frequency || 'One-time'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <CardTitle className="text-base flex items-center gap-2">
                <UploadCloud className="h-4 w-4" /> Proof of Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {instance.status === 'approved' || instance.status === 'submitted' ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center gap-4">
                  <FileType2 className="h-10 w-10 text-emerald-500" />
                  <div>
                    <h4 className="font-semibold text-emerald-900">Document Submitted</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">Verified automatically via OCR module.</p>
                  </div>
                  <Button variant="outline" className="ml-auto bg-white">View File</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!file ? (
                    <div 
                      className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('proof-upload')?.click()}
                    >
                      <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                      <div className="text-sm font-semibold text-slate-700">Upload signed document</div>
                      <div className="text-xs text-muted-foreground mt-1">PDF, JPG up to 10MB</div>
                      <input id="proof-upload" type="file" className="hidden" onChange={e => e.target.files && setFile(e.target.files[0])} accept=".pdf,image/*" />
                    </div>
                  ) : (
                    <div className="bg-slate-100 rounded-lg p-4 flex items-center gap-4 border">
                      <FileText className="h-10 w-10 text-primary" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{file.name}</h4>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setFile(null)}>Remove</Button>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button disabled={!file} className="w-full md:w-auto">
                      Submit for AI Review <CheckCircle2 className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" /> Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-white"></div>
                  <div className="text-sm font-semibold">Instance Created</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Automated by Scheduler</div>
                </div>
                {instance.status === 'submitted' || instance.status === 'approved' ? (
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-emerald-500 bg-white"></div>
                    <div className="text-sm font-semibold">Proof Uploaded</div>
                    <div className="text-xs text-muted-foreground mt-0.5">By Mine Manager</div>
                  </div>
                ) : null}
                {instance.status === 'approved' ? (
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-emerald-500 bg-emerald-500"></div>
                    <div className="text-sm font-semibold">Verified & Closed</div>
                    <div className="text-xs text-muted-foreground mt-0.5">System auto-verified</div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
