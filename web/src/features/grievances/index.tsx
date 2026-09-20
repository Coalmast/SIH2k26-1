import { useTranslation } from "react-i18next";
import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { MessageSquareWarning, Plus, Search, Filter, MessageCircle, MoreVertical, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const mockGrievances = [
  {
    id: 'GRV-105',
    title: 'Roof Support Failing in Sector 4',
    category: 'Safety',
    submittedBy: 'Anonymous Worker',
    date: '2026-09-20',
    status: 'open',
    aiSuggested: true,
    priority: 'high',
    source: 'voice',
    language: 'Hindi'
  },
  {
    id: 'GRV-104',
    title: 'Inadequate Dust Suppression on Haul Road B',
    category: 'Environment',
    submittedBy: 'Local Panchayat',
    date: '2026-09-05',
    status: 'open',
    aiSuggested: true
  },
  {
    id: 'GRV-103',
    title: 'Delayed Compensation Payment',
    category: 'Rehabilitation',
    submittedBy: 'Villager Group 3',
    date: '2026-08-28',
    status: 'in_progress',
    aiSuggested: false
  },
  {
    id: 'GRV-102',
    title: 'Excessive Blasting Noise at Night',
    category: 'Environment',
    submittedBy: 'Resident Association',
    date: '2026-08-15',
    status: 'resolved',
    aiSuggested: true
  }
]

export function GrievancesModule() {
  const {
    t
  } = useTranslation();

  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="outline" className="bg-[#f6465d]/15 text-comet-down border-[#f6465d]/30">{t("open", "Open")}</Badge>;
      case 'in_progress': return <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/30">{t("in_progress", "In Progress")}</Badge>;
      case 'resolved': return <Badge variant="outline" className="bg-[#0ecb81]/15 text-comet-up border-[#0ecb81]/30">{t("resolved", "Resolved")}</Badge>;
      default: return null
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/30 max-w-[1200px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <MessageSquareWarning className="h-8 w-8 text-primary" />{t("public_grievance_redressal", "Public Grievance Redressal")}</h1>
          <p className="text-muted-foreground mt-1">{t(
            "track_and_resolve_complaints_f",
            "Track and resolve complaints from local communities and stakeholders."
          )}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />{t("log_new_grievance", "Log New Grievance")}</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("log_new_grievance", "Log New Grievance")}</DialogTitle>
              <DialogDescription>Submit a new grievance to the redressal portal.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Enter grievance title..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="env">Environment</SelectItem>
                    <SelectItem value="rehab">Rehabilitation</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Submitted By</label>
                <Input placeholder="Name or organization..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Submit Grievance</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center bg-background p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search grievances by ID or keyword..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select defaultValue="all" onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_statuses", "All Statuses")}</SelectItem>
            <SelectItem value="open">{t("open", "Open")}</SelectItem>
            <SelectItem value="in_progress">{t("in_progress", "In Progress")}</SelectItem>
            <SelectItem value="resolved">{t("resolved", "Resolved")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {mockGrievances.filter(g => {
          const matchesFilter = filter === 'all' || g.status === filter;
          const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.id.toLowerCase().includes(searchQuery.toLowerCase()) || g.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesFilter && matchesSearch;
        }).map(g => (
          <Card key={g.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {g.id}
                  </span>
                  {g.source === 'voice' && (
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-500/30 flex items-center gap-1 shrink-0 px-1.5 py-0" title={`Voice Grievance (${g.language})`}>
                      🎙️ Voice
                    </Badge>
                  )}
                  <h3 className="font-semibold text-lg">{g.title}</h3>
                  {getStatusBadge(g.status)}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-medium bg-muted px-2 py-0.5 rounded text-foreground/80">{g.category}</span>
                  {g.priority === 'high' && (
                    <Badge variant="secondary" className="bg-red-500/10 text-red-500 border border-red-500/20">Priority: High</Badge>
                  )}
                  <span>{t("submitted_by", "Submitted by:")}<span className="font-medium text-foreground/80">{g.submittedBy}</span></span>
                  <span>{t("date", "Date:")}{new Date(g.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-3 items-center shrink-0">
                {g.aiSuggested && g.status === 'open' && (
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />{t("ai_action_ready", "AI Action Ready")}</Badge>
                )}
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />{t("view_thread", "View Thread")}</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/70">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
