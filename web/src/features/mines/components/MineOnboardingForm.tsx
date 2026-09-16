import { useTranslation } from "react-i18next";
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateMine } from '../hooks/useMines';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const mineSchema = z.object({
  subsidiary_id: z.string().min(1, 'Subsidiary is required'),
  name: z.string().min(2, 'Name is required'),
  mine_type: z.enum(['opencast', 'underground', 'mixed']),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  dgms_region: z.string().optional(),
  ec_number: z.string().optional(),
  coal_grade: z.string().optional(),
});

type FormValues = z.infer<typeof mineSchema>;

export function MineOnboardingForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    t
  } = useTranslation();

  const createMine = useCreateMine();

  const form = useForm<FormValues>({
    resolver: zodResolver(mineSchema),
    defaultValues: {
      name: '',
      subsidiary_id: '',
      mine_type: 'opencast',
      district: '',
      state: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createMine.mutateAsync(data);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to create mine:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("mine_name", "Mine Name")}</FormLabel>
              <FormControl>
                <Input placeholder="Rajmahal OCP" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="subsidiary_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("subsidiary_id_temp", "Subsidiary ID (Temp)")}</FormLabel>
                <FormControl>
                  <Input placeholder="UUID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mine_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("mine_type", "Mine Type")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="opencast">{t("opencast", "Opencast")}</SelectItem>
                    <SelectItem value="underground">{t("underground", "Underground")}</SelectItem>
                    <SelectItem value="mixed">{t("mixed", "Mixed")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("district", "District")}</FormLabel>
                <FormControl>
                  <Input placeholder="Godda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("state", "State")}</FormLabel>
                <FormControl>
                  <Input placeholder="Jharkhand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={createMine.isPending}>
          {createMine.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("onboard_mine", "Onboard Mine")}</Button>
      </form>
    </Form>
  );
}
