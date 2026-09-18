import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Loader2, AlertTriangle, FileText, 
  Copy, RefreshCcw, FileSearch, ShieldCheck 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OcrResult } from '../hooks/useOCR';

interface OcrResultPanelProps {
  result: OcrResult;
  fileName: string;
  onReset: () => void;
}

export function OcrResultPanel({ result, fileName, onReset }: OcrResultPanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string | null, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (result.status === 'idle') return null;

  return (
    <div className="mt-6 border border-border/50 rounded-xl bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Pipeline Status Header */}
      <div className="bg-muted/30 p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSearch className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium text-sm text-foreground truncate max-w-[200px]">{fileName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          {result.status === 'error' ? (
            <span className="flex items-center gap-1 text-destructive"><AlertTriangle className="h-4 w-4" /> Failed</span>
          ) : result.status === 'verified' ? (
            <span className="flex items-center gap-1 text-emerald-500"><ShieldCheck className="h-4 w-4" /> OCR Complete</span>
          ) : (
            <span className="flex items-center gap-1 text-amber-500"><Loader2 className="h-4 w-4 animate-spin" /> Processing</span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Progress Pipeline */}
        {result.status !== 'error' && result.status !== 'idle' && (
          <div className="flex items-center gap-2 w-full max-w-sm mx-auto my-4 text-xs">
             <div className={`flex flex-col items-center gap-1 ${result.status !== 'idle' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`h-2 w-full rounded-full ${result.status !== 'idle' ? 'bg-primary' : 'bg-muted'}`} />
                <span>Upload</span>
             </div>
             <div className={`flex flex-col items-center gap-1 ${['scanning', 'verified'].includes(result.status) ? 'text-amber-500' : 'text-muted-foreground'}`}>
                <div className={`h-2 w-full rounded-full ${['scanning', 'verified'].includes(result.status) ? 'bg-amber-500 animate-pulse' : 'bg-muted'}`} />
                <span>Scan</span>
             </div>
             <div className={`flex flex-col items-center gap-1 ${result.status === 'verified' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                <div className={`h-2 w-full rounded-full ${result.status === 'verified' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-muted'}`} />
                <span>Verified</span>
             </div>
          </div>
        )}

        {/* Error State */}
        {result.status === 'error' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1, x: [-5, 5, -5, 5, 0] }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
          >
            {result.error}
          </motion.div>
        )}

        {/* Success State - Raw Text */}
        {result.status === 'verified' && result.rawText && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/20 text-primary border-primary/30">Raw Text Extracted</Badge>
              {result.confidence && (
                <span className="text-xs text-muted-foreground">Confidence: {Math.round(result.confidence * 100)}%</span>
              )}
            </div>
            
            <div className="relative group">
              <pre className="bg-background border border-border/50 rounded-lg p-4 text-xs font-mono text-foreground/80 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {result.rawText}
              </pre>
              <button 
                onClick={() => handleCopy(result.rawText, 'raw_text')}
                className="absolute top-2 right-2 p-1.5 bg-muted/80 backdrop-blur-sm rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                {copiedField === 'raw_text' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground">
                <RefreshCcw className="h-3 w-3 mr-2" /> Scan Another
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
