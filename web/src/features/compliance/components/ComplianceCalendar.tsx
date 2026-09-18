import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from 'react';
import { EventCalendar } from '@/components/event-calendar';
import type { TaskItem, TaskStatusOption } from '@/components/event-calendar/types';
import { useComplianceInstances } from '../hooks/useCompliance';
import { Loader2, ShieldAlert, TrendingDown } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';

interface Props {
  mineId?: string;
}

const STATUS_OPTIONS: TaskStatusOption[] = [
  { value: 'pending', label: 'Pending', tone: 'active' },
  { value: 'in_progress', label: 'In Progress', tone: 'active' },
  { value: 'submitted', label: 'Submitted', tone: 'active' },
  { value: 'approved', label: 'Approved', tone: 'done' },
  { value: 'breached', label: 'Breached', tone: 'blocked' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  submitted: '#8b5cf6',
  approved: '#10b981',
  breached: '#ef4444',
}

export function ComplianceCalendar({ mineId }: Props) {
  const navigate = useNavigate();
  const { data: instances, isLoading } = useComplianceInstances(mineId, undefined);

  const calendarData = useMemo<TaskItem[]>(() => {
    if (!instances) return [];
    return instances.map((instance: any) => ({
      id: instance.id,
      name: instance.requirement?.title || 'Compliance Task',
      description: instance.requirement?.description || `Regulation: ${instance.requirement?.regulation?.code || 'N/A'}`,
      status: instance.status || 'pending',
      active: instance.status !== 'approved',
      setAt: instance.due_date,
      expireAt: instance.due_date,
      priority: instance.status === 'breached' ? 'high' : instance.status === 'pending' ? 'medium' : 'low',
    }));
  }, [instances]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <ShieldAlert className="absolute inset-0 m-auto h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  const breachedCount = (instances || []).filter((i: any) => i.status === 'breached').length;
  const pendingCount = (instances || []).filter((i: any) => i.status === 'pending').length;

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3 w-full">
      {/* Urgency banner if there are breaches */}
      {breachedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/15 via-red-500/8 to-transparent px-4 py-2.5 backdrop-blur-sm"
        >
          <TrendingDown className="h-4 w-4 text-red-400 shrink-0 animate-pulse" />
          <span className="text-sm font-medium text-red-300">
            <span className="font-bold text-red-400">{breachedCount} compliance deadline{breachedCount > 1 ? 's have' : ' has'} been breached.</span>
            {' '}Immediate action required.
          </span>
          <span className="ml-auto text-xs text-red-400/70">{pendingCount} still pending</span>
        </motion.div>
      )}

      {/* Calendar container with glassmorphism */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative flex flex-1 min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/60 shadow-2xl backdrop-blur-xl ring-1 ring-white/5"
      >
        {/* Top gradient accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <EventCalendar
          data={calendarData}
          defaultView="month"
          statusOptions={STATUS_OPTIONS}
          statusColors={STATUS_COLORS}
          showMiniNav={false}
          onTaskClick={(item) => {
            navigate({
              to: '/compliance/$mineId/$instanceId',
              params: { mineId: mineId || 'default', instanceId: item.id }
            });
          }}
        />

        {/* Bottom gradient fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </motion.div>
    </div>
  );
}
