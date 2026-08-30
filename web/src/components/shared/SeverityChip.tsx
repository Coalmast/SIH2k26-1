import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SeverityChipProps {
  severity: string;
}

export function SeverityChip({ severity }: SeverityChipProps) {
  const s = (severity || '').toLowerCase();
  
  switch (s) {
    case 'low':
    case 'minor':
      return <Badge className="bg-slate-500/10 text-slate-500 border-slate-500/20">{severity}</Badge>;
    case 'medium':
    case 'moderate':
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{severity}</Badge>;
    case 'high':
    case 'major':
      return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">{severity}</Badge>;
    case 'critical':
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">{severity}</Badge>;
    default:
      return <Badge variant="outline">{severity}</Badge>;
  }
}
