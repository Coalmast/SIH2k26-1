import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddObservation } from '../hooks/useInspections';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

import { ObservationCreateSchema } from '../schemas';

type FormValues = z.infer<typeof ObservationCreateSchema>;

// Hardcoded gas items for demo
const GAS_ITEMS = [
  { id: 'GAS-O2', name: 'Oxygen (O₂)', unit: '%', limit: 19.5, type: 'min', reg: 'CMR 2017, Reg. 5(1)(a)' },
  { id: 'GAS-CO2', name: 'Carbon Dioxide (CO₂)', unit: '%', limit: 0.5, type: 'max', reg: 'CMR 2017, Reg. 5(1)(c)' },
  { id: 'GAS-CH4', name: 'Methane (CH₄)', unit: '%', limit: 1.25, warning: 0.25, type: 'max', reg: 'CMR 2017, Reg. 5(2)' },
  { id: 'VENT-FLOW', name: 'Ventilation Air Quantity', unit: 'm³/min', limit: 30, type: 'min', reg: 'CMR 2017, Reg. 68(1)' },
  { id: 'TEMP-WB', name: 'Wet Bulb Temperature', unit: '°C', limit: 33.5, type: 'max', reg: 'CMR 2017, Reg. 5(2)' },
  { id: 'OTHER', name: 'Other / Non-Gas Observation', unit: '', limit: 0, type: 'none', reg: '' }
];

export function AddObservationForm({ inspectionId, onSuccess }: { inspectionId: string, onSuccess?: () => void }) {
  const addObservation = useAddObservation();
  const [selectedGas, setSelectedGas] = useState<typeof GAS_ITEMS[0] | null>(null);
  const [measuredValue, setMeasuredValue] = useState<string>('');
  const [autoAlert, setAutoAlert] = useState<{message: string, isDanger: boolean} | null>(null);
  const [progress, setProgress] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(ObservationCreateSchema),
    defaultValues: {
      checklist_item_id: '',
      status: 'ok',
      description: '',
      severity: 'minor',
      category: 'safety',
    },
  });

  const handleItemChange = (val: string) => {
    form.setValue('checklist_item_id', val);
    const gasItem = GAS_ITEMS.find(g => g.id === val) || null;
    setSelectedGas(gasItem);
    setMeasuredValue('');
    setAutoAlert(null);
  };

  const handleValueChange = (val: string) => {
    setMeasuredValue(val);
    if (!selectedGas || selectedGas.type === 'none' || val.trim() === '') {
      setAutoAlert(null);
      return;
    }
    
    const num = parseFloat(val);
    if (isNaN(num)) return;
    
    let isDanger = false;
    let isWarning = false;
    
    if (selectedGas.type === 'max' && num > selectedGas.limit) isDanger = true;
    if (selectedGas.type === 'min' && num < selectedGas.limit) isDanger = true;
    
    if (selectedGas.warning && selectedGas.type === 'max' && num > selectedGas.warning && !isDanger) {
      isWarning = true;
    }

    if (isDanger) {
      setAutoAlert({ message: `DANGER — Exceeds CMR limit of ${selectedGas.limit}${selectedGas.unit}`, isDanger: true });
      form.setValue('severity', 'critical');
      form.setValue('status', 'non_compliant');
      form.setValue('description', `${selectedGas.name} measured at ${num}${selectedGas.unit} — exceeds ${selectedGas.reg} limit of ${selectedGas.limit}${selectedGas.unit}`);
    } else if (isWarning) {
      setAutoAlert({ message: `WARNING — Exceeds warning threshold of ${selectedGas.warning}${selectedGas.unit}`, isDanger: false });
      form.setValue('severity', 'medium');
      form.setValue('status', 'observation');
      form.setValue('description', `${selectedGas.name} measured at ${num}${selectedGas.unit} (Warning threshold)`);
    } else {
      setAutoAlert(null);
      form.setValue('severity', 'minor');
      form.setValue('status', 'ok');
      form.setValue('description', `${selectedGas.name} measured at ${num}${selectedGas.unit} (Normal)`);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await addObservation.mutateAsync({ inspectionId, data });
      form.reset();
      setSelectedGas(null);
      setMeasuredValue('');
      setAutoAlert(null);
      setProgress(p => Math.min(15, p + 1));
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to add observation:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="checklist_item_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Checklist Item</FormLabel>
              <Select onValueChange={handleItemChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select checklist item" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GAS_ITEMS.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.id} — {item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedGas && selectedGas.type !== 'none' && (
          <div className="space-y-2">
            <FormLabel>Measured Value ({selectedGas.unit})</FormLabel>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                step="any"
                placeholder={`Limit: ${selectedGas.type === 'max' ? '<=' : '>='} ${selectedGas.limit}`} 
                value={measuredValue}
                onChange={e => handleValueChange(e.target.value)}
              />
              <span className="text-sm font-medium text-muted-foreground w-12">{selectedGas.unit}</span>
            </div>
            {autoAlert && (
              <div className={`flex items-center gap-2 p-2 rounded text-xs font-semibold ${autoAlert.isDanger ? 'bg-[#f6465d]/15 text-comet-down border border-[#f6465d]/30' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                <AlertTriangle className="h-4 w-4" />
                {autoAlert.message}
              </div>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the observation..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ok">OK</SelectItem>
                    <SelectItem value="observation">Observation</SelectItem>
                    <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between mt-4 mb-1">
          <span className="text-xs font-medium text-muted-foreground">Progress: {progress}/15 items</span>
        </div>
        <Progress value={(progress / 15) * 100} className="h-2 mb-4" />

        <Button type="submit" className="w-full" disabled={addObservation.isPending}>
          {addObservation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
          + Add Observation
        </Button>
      </form>
    </Form>
  );
}
