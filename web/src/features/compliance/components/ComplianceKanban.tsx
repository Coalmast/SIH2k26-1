import { useTranslation } from "react-i18next";
import React, { useMemo } from 'react';
import { useComplianceInstances } from '../hooks/useCompliance';
import { Loader2, Calendar } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban-board';
import { type KanbanData, type KanbanCardRenderer } from '@/components/kanban-board/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';

const KANBAN_COLUMNS = [
  { id: 'pending', title: 'PENDING' },
  { id: 'in_progress', title: 'IN PROGRESS' },
  { id: 'submitted', title: 'SUBMITTED' },
  { id: 'approved', title: 'APPROVED' }
];

const complianceCardRenderer: KanbanCardRenderer<any> = {
  id: 'compliance-card',
  label: 'Compliance Card',
  dragHandle: 'shell',
  render: (data, ctx) => {
    const isOverdue = new Date(data.due_date) < new Date() && data.status !== 'approved';
    const isApproved = data.status === 'approved';
    const regCategory = data.requirement?.regulation?.category;
    
    // Check if due within 48 hours
    const hoursUntilDue = (new Date(data.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60);
    const isDueSoon = !isOverdue && !isApproved && hoursUntilDue > 0 && hoursUntilDue <= 48;
    
    return (
      <motion.div
        layout
        whileHover={{ scale: 1.02, y: -2, zIndex: 10 }}
        whileTap={{ scale: 0.98, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Card className={`relative overflow-hidden border-0 shadow-md backdrop-blur-md transition-all duration-300 cursor-pointer group ${
          ctx.isDragging ? 'opacity-70 scale-105 shadow-2xl ring-2 ring-primary/50' : 'hover:shadow-lg'
        } ${isApproved ? 'bg-emerald-500/5 dark:bg-emerald-900/10' : 'bg-card/80 hover:bg-card'}`}>
          
          {/* Top gradient line */}
          <div className={`absolute top-0 inset-x-0 h-1 ${
            isApproved ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
            isOverdue ? 'bg-gradient-to-r from-red-400 to-rose-600' : 
            isDueSoon ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
            'bg-gradient-to-r from-primary/60 to-purple-500/60'
          }`} />

          {/* Background glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <CardContent className="p-4 flex flex-col gap-3 relative z-10">
            <div className="flex items-start justify-between gap-3">
              <span className="font-bold text-base leading-snug line-clamp-2 text-foreground/90 group-hover:text-foreground transition-colors">
                {data.requirement?.title || 'Task'}
              </span>
              <div className="flex items-center gap-1.5 shrink-0 mt-1">
                {isDueSoon && (
                  <span className="relative flex h-3 w-3" title="Due in < 48 hours">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
                {isOverdue && (
                  <span className="relative flex h-3 w-3" title="Overdue">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5 text-xs mt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium border border-border/50 shadow-sm">
                  {data.requirement?.regulation?.code || 'N/A'}
                </span>
                {regCategory === 'environment' && (
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                    Environment
                  </span>
                )}
                {regCategory === 'safety' && (
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                    Safety
                  </span>
                )}
              </div>
              
              <div className="h-px w-full bg-border/40 my-0.5" />
              
              <div className={`flex items-center justify-between w-full font-medium ${
                isOverdue ? 'text-red-500 dark:text-red-400' : 
                isApproved ? 'text-emerald-500 dark:text-emerald-400' :
                'text-muted-foreground'
              }`}>
                <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md border border-border/30">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="tracking-tight">
                    {isOverdue 
                      ? `Overdue by ${new Date(data.due_date).toLocaleDateString()}` 
                      : `Due: ${new Date(data.due_date).toLocaleDateString()}`
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
};

export function ComplianceKanban({ mineId, filterStatus, filterCategory }: { mineId?: string, filterStatus?: string | null, filterCategory?: string | null }) {
  const {
    t
  } = useTranslation();

  const { data: instances, isLoading } = useComplianceInstances(mineId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const boardData = useMemo<KanbanData>(() => {
    if (!instances) return { columns: [] };
    
    // Apply filters
    let filtered = instances;
    if (filterStatus) {
      filtered = filtered.filter((i: any) => i.status === filterStatus);
    }
    if (filterCategory) {
      filtered = filtered.filter((i: any) => i.requirement?.regulation?.category === filterCategory);
    }
    
    return {
      columns: KANBAN_COLUMNS.map(col => ({
        id: col.id,
        title: col.title,
        items: filtered
          .filter((i: any) => i.status === col.id)
          .map((i: any) => ({
            id: i.id,
            rendererId: 'compliance-card',
            data: i,
          }))
      }))
    };
  }, [instances, filterStatus, filterCategory]);

  if (isLoading) {
    return (
      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        {[1, 2, 3, 4].map((colIndex) => (
          <div key={colIndex} className="flex flex-col gap-4 flex-1 min-w-0">
            <Skeleton className="h-12 w-full rounded-xl bg-card/40" />
            {[1, 2, 3].map((cardIndex) => (
              <motion.div
                key={cardIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (colIndex * 0.1) + (cardIndex * 0.05), duration: 0.3 }}
              >
                <Skeleton className="h-[140px] w-full rounded-xl bg-card/60 shadow-sm" />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden h-full min-h-[500px]">
      <KanbanBoard
        renderers={[complianceCardRenderer]}
        data={boardData}
        readOnly={false} 
        onItemMove={({ item, to }) => {
          queryClient.setQueryData(['complianceInstances', mineId, undefined, undefined], (old: any) => {
            if (!old) return old;
            return old.map((i: any) => i.id === item.id ? { ...i, status: to.columnId } : i);
          });
        }}
        onItemClick={(item) => navigate({ to: '/compliance/$mineId/$instanceId', params: { mineId: mineId || 'default', instanceId: item.id } })}
      />
    </div>
  );
}
