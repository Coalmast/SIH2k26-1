import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from 'react';
import { EventCalendar } from '@/components/event-calendar';
import type { TaskItem, TaskStatusOption } from '@/components/event-calendar/types';
import { useComplianceInstances } from '../hooks/useCompliance';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';

interface Props {
  mineId?: string;
  filterStatus?: string | null;
  filterCategory?: string | null;
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
  
  // Category-specific overrides
  env_pending: '#3b82f6', // Slate/Blue for environment
  safety_pending: '#f59e0b', // Amber for safety
  high_priority: '#ef4444', // Red/Crimson
}

export function ComplianceCalendar({ mineId, filterStatus, filterCategory }: Props) {
  const navigate = useNavigate();
  const { data: instances, isLoading } = useComplianceInstances(mineId, undefined);

  const calendarData = useMemo<TaskItem[]>(() => {
    if (!instances) return [];
    
    // Apply filters
    let filtered = instances;
    if (filterStatus) {
      filtered = filtered.filter((i: any) => i.status === filterStatus);
    }
    if (filterCategory) {
      filtered = filtered.filter((i: any) => i.requirement?.regulation?.category === filterCategory);
    }
    
    
    const result: TaskItem[] = filtered.map((instance: any) => {
      const isOverdue = new Date(instance.due_date) < new Date() && instance.status !== 'approved';
      const category = instance.requirement?.regulation?.category;
      
      // Dynamic priority for color coding
      let priority: TaskItem['priority'] = 'medium';
      let statusColorRef = instance.status || 'pending';
      
      if (isOverdue || instance.status === 'breached') {
        priority = 'high';
        statusColorRef = 'high_priority';
      } else if (category === 'environment' && instance.status === 'pending') {
        priority = 'low';
        statusColorRef = 'env_pending';
      } else if (category === 'safety' && instance.status === 'pending') {
        priority = 'medium';
        statusColorRef = 'safety_pending';
      } else if (instance.status === 'approved') {
        priority = 'low';
      }
      
      return {
        id: instance.id,
        name: instance.requirement?.title || 'Compliance Task',
        description: instance.requirement?.description || `Regulation: ${instance.requirement?.regulation?.code || 'N/A'}`,
        status: statusColorRef, // Trick to use custom colors defined in STATUS_COLORS
        active: instance.status !== 'approved',
        setAt: instance.due_date,
        expireAt: instance.due_date,
        priority: priority,
        metadata: { category }
      };
    });
    
    // Add mock follow-up inspection 7 days from now
    const mockDate = new Date();
    mockDate.setDate(mockDate.getDate() + 7);
    
    result.push({
      id: 'mock-followup',
      name: '🔄 Follow-up Inspection — Air Quality Re-check',
      description: 'Regulation: EPA-1986',
      status: 'high_priority', 
      active: true,
      setAt: mockDate.toISOString(),
      expireAt: mockDate.toISOString(),
      priority: 'high',
      metadata: { category: 'environment' }
    });
    
    return result;
  }, [instances, filterStatus, filterCategory]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col p-4 bg-card/10 rounded-xl border border-border/40">
        <div className="flex justify-between items-center mb-6 px-4">
          <Skeleton className="h-8 w-48 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-border/50 rounded-xl overflow-hidden flex-1 border border-border/50">
          {Array.from({ length: 35 }).map((_, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (i % 7) * 0.05 + Math.floor(i / 7) * 0.05, duration: 0.3 }}
              className="bg-card min-h-[100px] p-2 flex justify-end"
            >
              <Skeleton className="h-6 w-6 rounded-full opacity-50" />
            </motion.div>
          ))}
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
