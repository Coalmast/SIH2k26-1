import React from 'react';
import { useMines } from '../../features/mines/hooks/useMines';
import { useAuthStore } from '../../stores/auth-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export function MineSelector() {
  const { data: mines, isLoading } = useMines();
  // In a real app we'd have a selectedMineId in our ui/auth store
  const { mineIds } = useAuthStore();
  
  if (isLoading) {
    return <div className="flex items-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" /> <span className="text-sm text-muted-foreground">Loading mines...</span></div>;
  }

  return (
    <Select defaultValue={mineIds && mineIds.length > 0 ? mineIds[0] : "all"}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select Mine" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Mines</SelectItem>
        {mines?.map((mine: any) => (
          <SelectItem key={mine.id} value={mine.id}>{mine.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
