import React, { useMemo } from 'react';
import { useComplianceInstances } from '../hooks/useCompliance';
import { Loader2, Calendar } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban-board';
import { KanbanData, KanbanCardRenderer } from '@/components/kanban-board/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from '@tanstack/react-router';

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
      <Card className={`border border-border/50 shadow-sm hover:border-primary/30 transition-colors ${ctx.isDragging ? 'opacity-50 ring-2 ring-primary' : ''} cursor-pointer`}>
        <CardContent className="p-3 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-sm leading-tight line-clamp-2">
              {data.requirement?.title || 'Task'}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-1">
            <span>Reg: {data.requirement?.regulation?.code || 'N/A'}</span>
            <div className={`flex items-center gap-1 mt-1 ${isOverdue ? 'text-comet-down font-medium' : ''}`}>
              <Calendar className="h-3 w-3" />
              {isOverdue 
                ? `Overdue by ${formatDistanceToNow(new Date(data.due_date))}` 
                : `Due: ${new Date(data.due_date).toLocaleDateString()}`
              }
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
};

export function ComplianceKanban({ mineId }: { mineId?: string }) {
  const { data: instances, isLoading } = useComplianceInstances(mineId);
  const navigate = useNavigate();

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
    <div className="flex flex-1 gap-4 overflow-hidden h-full min-h-[500px]">
      <KanbanBoard
        renderers={[complianceCardRenderer]}
        data={boardData}
        readOnly={true} // For now, we only view and click to open details
        onItemClick={(item) => navigate({ to: `/compliance/${item.id}` })}
      />
    </div>
  );
}
