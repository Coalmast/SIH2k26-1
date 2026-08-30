import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InspectionCreateSchema } from "../schemas";
import { useScheduleInspection } from "../hooks/useInspections";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ScheduleInspectionForm({ onSuccess }: { onSuccess?: () => void }) {
  const scheduleMutation = useScheduleInspection();
  
  const form = useForm<z.infer<typeof InspectionCreateSchema>>({
    resolver: zodResolver(InspectionCreateSchema),
    defaultValues: {
      mine_id: "",
      inspection_type: "dgms_annual_general",
      template_id: "",
      scheduled_date: new Date().toISOString().split('T')[0],
      zone: "",
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
              <FormLabel>Inspection Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="dgms_annual_general">DGMS Annual General</SelectItem>
                  <SelectItem value="internal_safety_committee">Internal Safety Committee</SelectItem>
                  <SelectItem value="environmental_pcb">Environmental PCB</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Simplified for now. mine_id and template_id would normally be fetched and selectable */}
        <FormField
          control={form.control}
          name="mine_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mine ID (UUID)</FormLabel>
              <FormControl>
                <Input placeholder="Enter Mine UUID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="template_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template ID (UUID)</FormLabel>
              <FormControl>
                <Input placeholder="Enter Template UUID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduled_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheduled Date</FormLabel>
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
