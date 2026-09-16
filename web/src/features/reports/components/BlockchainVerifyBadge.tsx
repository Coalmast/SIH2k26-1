import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Link as LinkIcon, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BlockchainVerifyBadgeProps {
  reportId: string;
  hash: string;
  className?: string;
}

type VerificationStatus = 'idle' | 'verifying' | 'verified' | 'failed';

export function BlockchainVerifyBadge({ reportId, hash, className }: BlockchainVerifyBadgeProps) {
  const [status, setStatus] = useState<VerificationStatus>('idle');

  const truncateHash = (h: string) => `${h.substring(0, 6)}...${h.substring(h.length - 4)}`;

  const handleVerify = async () => {
    setStatus('verifying');
    
    // Simulate blockchain verification API call
    // In a real app, this would call FastAPI /api/v1/reports/{reportId}/verify
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success (we assume the hash is correct for the demo)
      setStatus('verified');
      toast.success('Document integrity verified', {
        description: 'The cryptographic hash matches the blockchain record.'
      });
    } catch (error) {
      setStatus('failed');
      toast.error('Verification failed', {
        description: 'Could not verify document integrity.'
      });
    }
  };

  if (status === 'verified') {
    return (
      <div className={cn("flex flex-col gap-1 items-start", className)}>
        <span className="font-mono text-xs text-[#707A8A]" title={hash}>
          SHA-256: {truncateHash(hash)}
        </span>
        <div className="flex items-center text-[#0ECB81] text-xs font-semibold bg-[#0ECB81]/10 px-2 py-1 rounded-sm">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Verified Authentic
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={cn("flex flex-col gap-1 items-start", className)}>
        <span className="font-mono text-xs text-[#707A8A]" title={hash}>
          SHA-256: {truncateHash(hash)}
        </span>
        <div className="flex items-center text-[#F6465D] text-xs font-semibold bg-[#F6465D]/10 px-2 py-1 rounded-sm">
          <XCircle className="w-3 h-3 mr-1" />
          Hash Mismatch
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1 items-start", className)}>
      <span className="font-mono text-xs text-[#707A8A]" title={hash}>
        SHA-256: {truncateHash(hash)}
      </span>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleVerify}
        disabled={status === 'verifying'}
        className="h-6 px-2 text-xs text-[#FCD535] hover:text-[#F0B90B] hover:bg-[#FCD535]/10 p-0"
      >
        {status === 'verifying' ? (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ) : (
          <LinkIcon className="w-3 h-3 mr-1" />
        )}
        Verify Integrity
      </Button>
    </div>
  );
}
