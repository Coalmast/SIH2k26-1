import React from 'react';
import { Badge } from '@/components/ui/badge';

type StatusType = 'pending' | 'in_progress' | 'submitted' | 'revision_requested' | 'approved' | 'breached';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const s = (status || '').toLowerCase() as StatusType;
  
  switch (s) {
    case 'pending':
    case 'revision_requested':
      return <Badge className="bg-slate-500/10 text-muted-foreground hover:bg-slate-500/20 border-slate-500/20">{status}</Badge>;
    case 'in_progress':
      return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">{status}</Badge>;
    case 'submitted':
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">{status}</Badge>;
    case 'approved':
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">{status}</Badge>;
    case 'breached':
      return <Badge className="bg-comet-down/10 text-comet-down hover:bg-comet-down/20 border-red-500/20">{status}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
