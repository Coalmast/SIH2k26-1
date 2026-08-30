import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  regulation_id: z.string().min(1, 'Regulation is required'),
  mine_type: z.enum(['OCP', 'UG', 'Mixed']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'half_yearly', 'annual']),
  grace_period_days: z.number().min(0).default(0),
});

type FormData = z.infer<typeof schema>;

export function CreateRequirementForm({ onSuccess }: { onSuccess?: () => void }) {
  const { control, register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { grace_period_days: 0, mine_type: 'OCP', frequency: 'monthly' }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/compliance/requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        onSuccess?.();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input {...register('title')} placeholder="e.g. EC Half-yearly report" />
        {errors.title && <span className="text-xs text-destructive">{errors.title.message}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Mine Type</label>
          <Controller
            name="mine_type"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OCP">Opencast (OCP)</SelectItem>
                  <SelectItem value="UG">Underground (UG)</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Frequency</label>
          <Controller
            name="frequency"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="half_yearly">Half-yearly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Grace Period (Days)</label>
        <Input type="number" {...register('grace_period_days', { valueAsNumber: true })} />
      </div>

      <Button type="submit" className="w-full">Create Requirement</Button>
    </form>
  );
}
