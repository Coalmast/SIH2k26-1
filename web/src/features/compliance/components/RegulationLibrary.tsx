import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { CreateRequirementForm } from '../forms/CreateRequirementForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function RegulationLibrary() {
  const { data: regulations, isLoading } = useQuery({
    queryKey: ['regulations'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/compliance/requirements`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    }
  });

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Regulation Library</h1>
          <p className="text-muted-foreground">Master repository of mining regulations & requirements</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground gap-2">
              <Plus className="h-4 w-4" /> Add Requirement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Compliance Requirement</DialogTitle>
            </DialogHeader>
            <CreateRequirementForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Authority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Loading regulations...</TableCell>
                </TableRow>
              ) : regulations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No regulations found</TableCell>
                </TableRow>
              ) : (
                regulations?.map((reg: any) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.code}</TableCell>
                    <TableCell>{reg.title}</TableCell>
                    <TableCell><Badge variant="outline">{reg.category}</Badge></TableCell>
                    <TableCell>{reg.authority}</TableCell>
                    <TableCell>
                      {reg.is_active ? 
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge> : 
                        <Badge variant="secondary">Inactive</Badge>
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
