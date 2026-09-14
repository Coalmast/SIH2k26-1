import { useTranslation } from "react-i18next";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldAlert, Clock, History, Upload, Loader2 } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useComplianceInstances } from '../hooks/useCompliance';
import { ComplianceHealthScore } from './ComplianceHealthScore';

const COLUMNS = [
  { id: 'pending', label: 'PENDING', color: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' },
  { id: 'in_progress', label: 'IN PROGRESS', color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' },
  { id: 'submitted', label: 'SUBMITTED', color: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20' },
  { id: 'approved', label: 'APPROVED', color: 'bg-green-500/10 text-green-500 hover:bg-green-500/20' },
  { id: 'breached', label: 'BREACHED', color: 'bg-comet-down/10 text-comet-down hover:bg-comet-down/20' }
];

interface Props {
  mineId?: string;
}

export function ComplianceCalendar({ mineId }: Props) {
  const {
    t
  } = useTranslation();

  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [month, setMonth] = useState('2026-09');

  const { data: instances, isLoading } = useComplianceInstances(mineId, month);

  const filteredTasks = (instances || []).filter((task: any) => filter === 'All' || task.requirement?.category === filter);

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("compliance_calendar", "Compliance Calendar")}</h1>
          <p className="text-muted-foreground">{t(
            "manage_and_track_compliance_su",
            "Manage and track compliance submissions"
          )}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={mineId || "all"} onValueChange={(val) => navigate({ to: `/compliance/${val}` })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Mine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all_mines", "All Mines")}</SelectItem>
              <SelectItem value="mine-1">{t("rajmahal_ocp", "Rajmahal OCP")}</SelectItem>
              <SelectItem value="mine-2">{t("sonepur_bazari", "Sonepur Bazari")}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2027-01">{t("jan_2027", "Jan 2027")}</SelectItem>
              <SelectItem value="2027-02">{t("feb_2027", "Feb 2027")}</SelectItem>
              <SelectItem value="2027-03">{t("mar_2027", "Mar 2027")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {mineId && mineId !== 'all' && (
        <div className="w-full xl:w-1/2">
          <ComplianceHealthScore mineId={mineId} />
        </div>
      )}

      <div className="flex gap-2">
        {['All', 'Safety', 'Environment', 'Production', 'Labour'].map((f) => (
          <Button 
            key={f} 
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="grid h-full grid-cols-5 gap-6">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <Badge variant="secondary" className={col.color}>
                {filteredTasks.filter((t: any) => t.status === col.id).length}
              </Badge>
            </div>
            
            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
              <div className="flex flex-col gap-4">
                {isLoading ? (
                  <div className="flex justify-center p-4 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /></div>
                ) : (
                  filteredTasks.filter((t: any) => t.status === col.id).map((task: any) => (
                    <Card key={task.id} className="border-border/50 bg-card/50 backdrop-blur transition-colors hover:bg-card/80">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start gap-2">
                          <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-primary" />
                          <CardTitle className="text-sm font-semibold leading-tight">{task.requirement?.title || 'Unknown Requirement'}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3 p-4 pt-0 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{t("due", "Due:")}{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                        {task.assigned_to && (
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">{t("assigned", "Assigned:")}</span> {task.assigned_to}
                          </div>
                        )}
                        
                        <div className="mt-2 flex items-center gap-2">
                          <Link 
                            to="/compliance/$mineId/$instanceId" 
                            params={{ mineId: mineId || 'default', instanceId: task.id }}
                            className="flex-1"
                          >
                            <Button size="sm" className="w-full gap-2 bg-[#FCD535] text-black hover:bg-[#FCD535]/90">
                              <Upload className="h-3 w-3" />{t("view", "View")}</Button>
                          </Link>
                          <Button size="sm" variant="outline" className="px-2">
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}
