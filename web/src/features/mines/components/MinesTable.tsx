import React from 'react';
import { useMines } from '../hooks/useMines';
import { Loader2, MapPin, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function MinesTable() {
  const { data: mines, isLoading } = useMines();

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mine Name</TableHead>
            <TableHead>Subsidiary</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mines?.map((mine: any) => (
            <TableRow key={mine.id}>
              <TableCell className="font-medium">{mine.name}</TableCell>
              <TableCell>{mine.subsidiaries?.name || '-'}</TableCell>
              <TableCell className="capitalize">{mine.mine_type}</TableCell>
              <TableCell>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-1 h-3 w-3" />
                  {mine.district}, {mine.state}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={mine.status === 'active' ? 'default' : 'secondary'} className={mine.status === 'active' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''}>
                  {mine.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" title="View Details">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" title="Edit Mine">
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(!mines || mines.length === 0) && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No mines found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
