import { useTranslation } from "react-i18next";
import React from 'react';
import { useMines } from '../../features/mines/hooks/useMines';
import { useAuthStore } from '../../stores/auth-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export function MineSelector() {
  const {
    t
  } = useTranslation();

  const { data: mines, isLoading } = useMines();
  const mineIds = useAuthStore(state => state.auth.mineIds);

  if (isLoading) {
    return <div className="flex items-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" /> <span className="text-sm text-muted-foreground">{t("loading_mines", "Loading mines...")}</span></div>;
  }

  return (
    <Select defaultValue={mineIds && mineIds.length > 0 ? mineIds[0] : "all"}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select Mine" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("all_mines", "All Mines")}</SelectItem>
        {mines?.map((mine: any) => (
          <SelectItem key={mine.id} value={mine.id}>{mine.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
