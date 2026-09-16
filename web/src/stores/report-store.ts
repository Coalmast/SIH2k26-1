import { create } from 'zustand';

interface SignaturePayload {
  signatureDataUrl: string;
  signedAt: string;
  managerName: string;
}

interface ReportSignatureStore {
  signatureDataUrl: string | null;
  signedAt: string | null;
  managerName: string | null;
  setSignature: (data: SignaturePayload) => void;
  clearSignature: () => void;
}

export const useReportSignatureStore = create<ReportSignatureStore>((set) => ({
  signatureDataUrl: null,
  signedAt: null,
  managerName: null,
  setSignature: (data) => set({ 
    signatureDataUrl: data.signatureDataUrl, 
    signedAt: data.signedAt,
    managerName: data.managerName 
  }),
  clearSignature: () => set({ 
    signatureDataUrl: null, 
    signedAt: null, 
    managerName: null 
  }),
}));
