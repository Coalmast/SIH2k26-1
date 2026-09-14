import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShieldAlert, Plus, Search, Filter, FileText, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'

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
  const [filter, setFilter] = useState('all')

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>
      case 'high': return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">High</Badge>
      case 'medium': return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Medium</Badge>
      default: return <Badge variant="outline" className="bg-[#0ecb81]/15 text-comet-up border-[#0ecb81]/30">Minor</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'investigating': return <Badge variant="secondary">Investigating</Badge>
      case 'resolved': return <Badge variant="outline" className="bg-muted">Resolved</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/30 max-w-[1200px] mx-auto w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-primary" />
            Incident Register
          </h1>
          <p className="text-muted-foreground mt-1">Log, investigate, and report workplace incidents to DGMS.</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> File Incident Report</Button>
      </div>

      <div className="flex gap-4 items-center bg-background p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search incidents..." className="pl-9" />
        </div>
        <Select defaultValue="all" onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="minor">Minor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {mockIncidents.filter(i => filter === 'all' || i.severity === filter).map(incident => (
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
                  <span>📍 {incident.zone}</span>
                  <span>⏰ {incident.shift}</span>
                  <span>📅 {new Date(incident.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-3 md:flex-col lg:flex-row shrink-0">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" /> Form 4-A
                </Button>
                <Link to={`/incidents/$id`} params={{ id: incident.id }}>
                  <Button size="sm">
                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
