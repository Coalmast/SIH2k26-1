import { useTranslation } from "react-i18next";
import React, { useMemo } from 'react';
import { useComplianceInstances } from '../hooks/useCompliance';
import { Loader2, Calendar } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban-board';
import { type KanbanData, type KanbanCardRenderer } from '@/components/kanban-board/types';
import { Card, CardContent } from '@/components/ui/card';
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
    return (
      <motion.div
        layout
        whileHover={{ scale: 1.02, rotate: -1, zIndex: 10 }}
        whileTap={{ scale: 0.98, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Card className={`border border-border/50 shadow-sm hover:border-primary/50 transition-colors ${ctx.isDragging ? 'opacity-50 ring-2 ring-primary scale-105 shadow-xl' : ''} cursor-pointer`}>
          <CardContent className="p-3 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-sm leading-tight line-clamp-2">
                {data.requirement?.title || 'Task'}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-1">
              <div className="flex items-center gap-2">
                <span>Reg: {data.requirement?.regulation?.code || 'N/A'}</span>
                {data.requirement?.regulation?.category === 'environment' && (
                  <span className="bg-green-500/20 text-green-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Environment</span>
                )}
                {data.requirement?.regulation?.category === 'safety' && (
                  <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Safety</span>
                )}
              </div>
              <div className={`flex items-center gap-1 mt-1 ${isOverdue ? 'text-comet-down font-medium' : ''}`}>
                <Calendar className="h-3 w-3" />
                {isOverdue 
                  ? `Overdue by ${new Date(data.due_date).toLocaleDateString()}` 
                  : `Due: ${new Date(data.due_date).toLocaleDateString()}`
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
};

export function ComplianceKanban({ mineId }: { mineId?: string }) {
  const {
    t
  } = useTranslation();

  const { data: instances, isLoading } = useComplianceInstances(mineId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const boardData = useMemo<KanbanData>(() => {
    if (!instances) return { columns: [] };
    
    return {
      columns: KANBAN_COLUMNS.map(col => ({
        id: col.id,
        title: col.title,
        items: instances
          .filter((i: any) => i.status === col.id)
          .map((i: any) => ({
            id: i.id,
            rendererId: 'compliance-card',
            data: i,
          }))
      }))
    };
  }, [instances]);

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
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
