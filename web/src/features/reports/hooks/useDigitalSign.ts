import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useReportSignatureStore } from '@/stores/report-store';

interface SignReportPayload {
  reportId: string;
  signatureDataUrl: string;
  signedAt: string;
  managerName: string;
}

export function useDigitalSign() {
  const queryClient = useQueryClient();
  const setSignature = useReportSignatureStore((state) => state.setSignature);

  return useMutation({
    mutationFn: async (payload: SignReportPayload) => {
      // In a real app, this would be an API call to FastAPI
      // e.g., POST /api/v1/reports/${payload.reportId}/sign
      
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      return { success: true, ...payload };
    },
    onSuccess: (data) => {
      // Update the local Zustand store for immediate UI feedback
      setSignature({
        signatureDataUrl: data.signatureDataUrl,
        signedAt: data.signedAt,
        managerName: data.managerName,
      });

      // Invalidate queries so the history table updates
      queryClient.invalidateQueries({ queryKey: ['statutory_reports'] });
    },
  });
}
