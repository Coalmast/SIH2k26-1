import { useTranslation } from "react-i18next";
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EvidenceUploader } from '../components/EvidenceUploader';
import { useSubmitEvidence } from '../hooks/useCompliance';

const schema = z.object({
  files: z.array(z.any()).min(1, 'Please select at least one file'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  instanceId: string;
  onSuccess?: () => void;
}

export function SubmitEvidenceForm({ instanceId, onSuccess }: Props) {
  const {
    t
  } = useTranslation();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { files: [], notes: '' }
  });

  const submitEvidence = useSubmitEvidence();

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    data.files.forEach((file: File) => formData.append('files', file));
    if (data.notes) formData.append('notes', data.notes);

    try {
      await submitEvidence.mutateAsync({ instanceId, formData });
      onSuccess?.();
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Controller
          name="files"
          control={control}
          render={({ field }) => (
            <EvidenceUploader 
              onFilesSelected={field.onChange} 
              uploading={submitEvidence.isPending} 
            />
          )}
        />
        {errors.files && <p className="text-sm text-destructive mt-1">{errors.files.message as string}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("additional_notes_optional", "Additional Notes (Optional)")}</label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Textarea 
              {...field} 
              placeholder="Add any remarks for the reviewer..." 
              className="resize-none h-24"
              disabled={submitEvidence.isPending}
            />
          )}
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitEvidence.isPending}>
        {submitEvidence.isPending ? 'Uploading...' : 'Submit Evidence'}
      </Button>
    </form>
  );
}
