import { useTranslation } from "react-i18next";
import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShieldAlert, Plus, Search, Filter, FileText, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"

const mockIncidents = [
  {
    id: 'INC-2026-001',
    type: 'Roof Fall',
    severity: 'high',
    zone: 'Pit 3 East',
    shift: 'Shift A',
    date: '2026-09-02T10:15:00Z',
    status: 'investigating',
    desc: 'Minor roof fall in development heading. No injuries, but operations halted.'
  },
  {
    id: 'INC-2026-002',
    type: 'Machinery Breakdown',
    severity: 'medium',
    zone: 'Crusher Unit 2',
    shift: 'Shift C',
    date: '2026-08-28T22:30:00Z',
    status: 'resolved',
    desc: 'Conveyor belt snapped causing 4-hour delay.'
  },
  {
    id: 'INC-2026-003',
    type: 'Slip & Fall',
    severity: 'minor',
    zone: 'Workshop',
    shift: 'Shift B',
    date: '2026-08-25T14:10:00Z',
    status: 'resolved',
    desc: 'Worker slipped on oil spill. First aid administered.'
  }
]

export function IncidentsList() {
  const {
    t
  } = useTranslation();

  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="outline" className="bg-[#f6465d]/15 text-comet-down border-[#f6465d]/30">{t("critical", "Critical")}</Badge>;
      case 'high': return <Badge variant="outline" className="bg-orange-500/15 text-orange-600 border-orange-500/30">{t("high", "High")}</Badge>;
      case 'medium': return <Badge variant="outline" className="bg-amber-500/15 text-amber-600 border-amber-500/30">{t("medium", "Medium")}</Badge>;
      default: return <Badge variant="outline" className="bg-[#0ecb81]/15 text-comet-up border-[#0ecb81]/30">{t("minor", "Minor")}</Badge>;
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'investigating': return <Badge variant="secondary">{t("investigating", "Investigating")}</Badge>;
      case 'resolved': return <Badge variant="outline" className="bg-muted">{t("resolved", "Resolved")}</Badge>;
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/30 max-w-[1200px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-primary" />{t("incident_register", "Incident Register")}</h1>
          <p className="text-muted-foreground mt-1">{t(
            "log_investigate_and_report_wor",
            "Log, investigate, and report workplace incidents to DGMS."
          )}</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />{t("file_incident_report", "File Incident Report")}</Button>
      </div>

      <div className="flex gap-4 items-center bg-background p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search incidents..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select defaultValue="all" onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_severities", "All Severities")}</SelectItem>
            <SelectItem value="critical">{t("critical", "Critical")}</SelectItem>
            <SelectItem value="high">{t("high", "High")}</SelectItem>
            <SelectItem value="medium">{t("medium", "Medium")}</SelectItem>
            <SelectItem value="minor">{t("minor", "Minor")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {mockIncidents.filter(i => {
          const matchesFilter = filter === 'all' || i.severity === filter;
          const matchesSearch = i.type.toLowerCase().includes(searchQuery.toLowerCase()) || i.desc.toLowerCase().includes(searchQuery.toLowerCase()) || i.id.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesFilter && matchesSearch;
        }).map(incident => (
          <Card key={incident.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col md:flex-row gap-6 md:items-center">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {incident.id}
                  </span>
                  <h3 className="text-lg font-bold">{incident.type}</h3>
                  {getSeverityBadge(incident.severity)}
                  {getStatusBadge(incident.status)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{incident.desc}</p>
                <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                  <span>{t("text", "📍")}{incident.zone}</span>
                  <span>{t("text", "⏰")}{incident.shift}</span>
                  <span>{t("text", "📅")}{new Date(incident.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-3 md:flex-col lg:flex-row shrink-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />{t("form_4_a", "Form 4-A")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Form 4-A (Statutory Incident Report)</DialogTitle>
                      <DialogDescription>
                        Draft report for incident {incident.id}. Auto-populated with available data.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto bg-muted/30 p-4 border rounded-md">
                      <div className="bg-white dark:bg-slate-900 p-8 shadow-sm border text-sm space-y-6">
                        <div className="text-center font-bold uppercase underline mb-6 text-foreground/80">Form 4-A</div>
                        <div className="text-center font-bold mb-4 text-foreground">[See Regulation 9]</div>
                        <div className="space-y-4 text-foreground/90 font-mono">
                          <p>1. Name of Mine: Dhanbad Central Colliery</p>
                          <p>2. Name of Owner: Coal India Limited</p>
                          <p>3. Date and time of incident: {new Date(incident.date).toLocaleString()}</p>
                          <p>4. Location of incident: {incident.zone}</p>
                          <p>5. Classification: {incident.type}</p>
                          <p>6. Brief Description: {incident.desc}</p>
                          <p>7. Actions Taken: Immediate operations halted. Area cordoned off.</p>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Download PDF</Button>
                      <Button>Sign & Submit to DGMS</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Link to={`/incidents/$id`} params={{ id: incident.id }}>
                  <Button size="sm">{t("view_details", "View Details")}<ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
