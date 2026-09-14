import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { InspectionCreateSchema } from "../schemas";
import { useScheduleInspection } from "../hooks/useInspections";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ScheduleInspectionForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    t
  } = useTranslation();

  const scheduleMutation = useScheduleInspection();

  const form = useForm<z.infer<typeof InspectionCreateSchema>>({
    resolver: zodResolver(InspectionCreateSchema),
    defaultValues: {
      mine_id: "00000000-0000-0000-0000-000000000004",
      inspection_type: "environmental_pcb",
      checklist_template_id: "00000000-0000-0000-0000-000000000020",
      scheduled_date: new Date().toISOString().split('T')[0],
      zone: "Pit 3 East",
    },
  });

  const onSubmit = (data: z.infer<typeof InspectionCreateSchema>) => {
    scheduleMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="inspection_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("inspection_type", "Inspection Type")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="dgms_annual_general">{t("dgms_annual_general", "DGMS Annual General")}</SelectItem>
                  <SelectItem value="internal_safety_committee">{t("internal_safety_committee", "Internal Safety Committee")}</SelectItem>
                  <SelectItem value="environmental_pcb">{t("environmental_pcb", "Environmental PCB")}</SelectItem>
                  <SelectItem value="electrical">{t("electrical", "Electrical")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Hardcoded dropdowns for Demo Workflow to avoid raw UUID inputs */}
        <FormField
          control={form.control}
          name="mine_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("mine", "Mine")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Mine" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="00000000-0000-0000-0000-000000000004">{t("umrer_ocp", "Umrer OCP")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="checklist_template_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("template", "Template")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="00000000-0000-0000-0000-000000000020">{t("environmental_gas_air_quality", "Environmental Gas & Air Quality")}</SelectItem>
                  <SelectItem value="00000000-0000-0000-0000-000000000021">{t("dgms_annual_general_safety", "DGMS Annual General Safety")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduled_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("scheduled_date", "Scheduled Date")}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={scheduleMutation.isPending} className="w-full">
          {scheduleMutation.isPending ? "Scheduling..." : "Schedule Inspection"}
        </Button>
      </form>
    </Form>
  );
}
