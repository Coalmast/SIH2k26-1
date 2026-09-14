import { useTranslation } from "react-i18next";
import React, { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, AlertTriangle, ChevronLeft, Calendar, FileText, Send, CheckCircle } from 'lucide-react'
import { Link, useRouter } from '@tanstack/react-router'
import { Route } from '@/routes/_authenticated/grievances/$id'
import { ViolationTimeline } from '@/components/shared/ViolationTimeline'

const MOCK_GRIEVANCE = {
  id: "GRV-2026-042",
  status: "in_progress" as const,
  category: "Safety Equipment",
  title: "Defective Dust Masks Provided",
  description: "The N95 masks provided in shift A on 12/09/2026 have broken straps and do not fit properly. Several workers are exposed to coal dust.",
  filer: "Anonymous Worker",
  dateFiled: "2026-09-12",
  priority: "High",
  aiSentiment: "Urgent/Safety Risk",
  similarGrievances: [
    { id: "GRV-2026-038", title: "Mask straps breaking easily", status: "resolved", date: "2026-09-01" },
    { id: "GRV-2025-112", title: "Poor quality safety goggles", status: "resolved", date: "2025-11-15" }
  ]
}

export function GrievanceDetail() {
  const {
    t
  } = useTranslation();

  const { id } = Route.useParams()
  const router = useRouter()
  const [grievance, setGrievance] = useState<Omit<typeof MOCK_GRIEVANCE, 'status'> & { status: 'in_progress' | 'closed' }>(MOCK_GRIEVANCE)
  const [reply, setReply] = useState("")
  const [thread, setThread] = useState([
    { sender: "System", message: "Grievance automatically assigned to Safety Officer (Rajesh K.)", time: "12/09/2026 08:45 AM" }
  ])

  const handleReply = () => {
    if (!reply.trim()) return
    setThread([...thread, { sender: "You", message: reply, time: new Date().toLocaleString() }])
    setReply("")
  }

  const handleResolve = () => {
    setGrievance(prev => ({ ...prev, status: 'closed' as const }))
  }

  return (
    <>
      <Header fixed />
      <Main className="flex flex-1 flex-col p-6 bg-muted/30 min-h-screen">
        <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <Button variant="ghost" size="icon" asChild className="mt-1">
                <Link to="/grievances">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">{grievance.title}</h1>
                  <Badge variant={grievance.status === 'closed' ? 'default' : 'secondary'} className={grievance.status === 'closed' ? 'bg-comet-up' : ''}>
                    {grievance.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" /> {id} | <Calendar className="h-4 w-4 ml-2" />{t("filed_on", "Filed on")}{grievance.dateFiled}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {grievance.status !== 'closed' && (
                <Button onClick={handleResolve} className="bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="mr-2 h-4 w-4" />{t("mark_as_resolved", "Mark as Resolved")}</Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-center">{t("grievance_details", "Grievance Details")}<Badge variant="outline" className="bg-[#f6465d]/10 text-comet-down border-[#f6465d]/30">
                      <AlertTriangle className="h-3 w-3 mr-1" />{t("ai_priority", "AI Priority:")}{grievance.priority}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">{t("category", "Category")}</h4>
                    <p className="text-foreground/80">{grievance.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">{t("description", "Description")}</h4>
                    <p className="text-foreground/80 p-4 bg-muted/50 rounded-lg border border-border/50 italic">{t("text", "\"")}{grievance.description}{t("text", "\"")}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">{t("ai_sentiment_analysis", "AI Sentiment Analysis")}</h4>
                    <p className="text-foreground/80">{grievance.aiSentiment}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{t("resolution_thread", "Resolution Thread")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {thread.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2 rounded-lg max-w-[80%] ${
                          msg.sender === 'You' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground/70 mt-1">{msg.sender}{t("text", "•")}{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {grievance.status !== 'closed' && (
                    <div className="flex gap-3 pt-4 border-t border-border/50">
                      <Textarea 
                        placeholder="Type an update or request for info..."
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                      <Button onClick={handleReply} className="h-auto w-16" disabled={!reply.trim()}>
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              <Card className="shadow-sm bg-blue-50/50 border-blue-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md flex items-center gap-2 text-blue-900">
                    <MessageSquare className="h-4 w-4" />{t("similar_past_grievances", "Similar Past Grievances")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-blue-700 mb-4">{t("ai_found", "AI found")}{grievance.similarGrievances.length}{t(
                    "related_issues_that_were_previ",
                    "related issues that were previously resolved."
                  )}</p>
                  <div className="space-y-3">
                    {grievance.similarGrievances.map(sim => (
                      <div key={sim.id} className="bg-background p-3 rounded shadow-sm border border-blue-100/50 hover:border-blue-300 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{sim.title}</p>
                          <Badge variant="outline" className="text-[10px] bg-[#0ecb81]/10 text-comet-up border-[#0ecb81]/30">
                            {sim.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{t("id", "ID:")}{sim.id}{t("text", "•")}{sim.date}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>
        </div>
      </Main>
    </>
  );
}
