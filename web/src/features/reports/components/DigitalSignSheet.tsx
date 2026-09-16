import React, { useState, useRef } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { SignatureCanvas, SignatureCanvasRef } from './SignatureCanvas';
import { CheckCircle2, ChevronRight, PenTool } from 'lucide-react';
import { format } from 'date-fns';

interface DigitalSignSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { signatureDataUrl: string; signedAt: string; managerName: string }) => void;
}

export function DigitalSignSheet({ isOpen, onClose, onConfirm }: DigitalSignSheetProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [checklistReviewed, setChecklistReviewed] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<SignatureCanvasRef>(null);
  const managerName = "Suresh Patel"; // In a real app, this comes from auth context

  // Reset state when sheet opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setChecklistReviewed(false);
      setTypedSignature('');
      setSignatureDataUrl(null);
      if (canvasRef.current) {
        canvasRef.current.clear();
      }
    }
  }, [isOpen]);

  // Create a canvas from typed text to standardize the output format
  const generateTypedSignatureDataUrl = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'italic 48px serif';
      ctx.fillStyle = '#181A20';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(typedSignature || managerName, canvas.width / 2, canvas.height / 2);
    }
    return canvas.toDataURL('image/png');
  };

  const handleNextToStep2 = () => {
    if (checklistReviewed) setStep(2);
  };

  const handleNextToStep3 = () => {
    let dataUrl: string | null = null;
    if (signatureMode === 'draw') {
      if (canvasRef.current && !canvasRef.current.isEmpty()) {
        dataUrl = canvasRef.current.toDataURL();
      }
    } else {
      if (typedSignature.trim() !== '') {
        dataUrl = generateTypedSignatureDataUrl();
      }
    }

    if (dataUrl) {
      setSignatureDataUrl(dataUrl);
      setStep(3);
    }
  };

  const handleConfirm = () => {
    if (signatureDataUrl) {
      onConfirm({
        signatureDataUrl,
        signedAt: new Date().toISOString(),
        managerName: managerName
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[480px] sm:w-[540px] bg-[#1E2329] border-[#2B3139] text-[#EAECEF] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b border-[#2B3139]">
          <SheetTitle className="text-[#EAECEF] flex items-center">
            <PenTool className="w-5 h-5 mr-2 text-[#FCD535]" />
            Digital Signature
          </SheetTitle>
          <SheetDescription className="text-[#707A8A]">
            Complete the signing workflow to finalize the document.
          </SheetDescription>
          
          {/* Progress Indicator */}
          <div className="flex items-center space-x-2 pt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 h-1.5 rounded-full bg-[#2B3139] overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${step >= s ? 'bg-[#FCD535]' : 'bg-transparent'}`}
                />
              </div>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: Checklist */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">1. Review Checklist</h3>
              <p className="text-sm text-[#707A8A]">
                Please ensure all sections of the report are accurate before signing.
              </p>
              
              <div className="space-y-4 bg-[#0B0E11] p-4 rounded-lg border border-[#2B3139]">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm">Report data verified against system records</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm">Reporting period matches regulatory requirement</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-sm">Required narrative sections and evidence attached</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6 p-4 border border-[#2B3139] rounded-lg">
                <Checkbox 
                  id="review-check" 
                  checked={checklistReviewed} 
                  onCheckedChange={(c) => setChecklistReviewed(c as boolean)} 
                  className="border-[#707A8A] data-[state=checked]:bg-[#FCD535] data-[state=checked]:text-[#181A20]"
                />
                <label 
                  htmlFor="review-check" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I have reviewed the document and confirm it is ready for signing.
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Capture Signature */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">2. Provide Signature</h3>
              
              <Tabs defaultValue="draw" onValueChange={(v) => setSignatureMode(v as 'draw' | 'type')}>
                <TabsList className="w-full grid grid-cols-2 bg-[#0B0E11] border border-[#2B3139]">
                  <TabsTrigger value="draw" className="data-[state=active]:bg-[#2B3139] data-[state=active]:text-white">
                    Draw
                  </TabsTrigger>
                  <TabsTrigger value="type" className="data-[state=active]:bg-[#2B3139] data-[state=active]:text-white">
                    Type
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="draw" className="mt-4 space-y-4">
                  <SignatureCanvas ref={canvasRef} />
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => canvasRef.current?.clear()}
                      className="text-[#707A8A] hover:text-white"
                    >
                      Clear Canvas
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="type" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[#707A8A]">Type your full name</label>
                    <Input 
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="e.g. Suresh Patel"
                      className="bg-[#0B0E11] border-[#2B3139] focus-visible:ring-[#FCD535]"
                    />
                  </div>
                  <div className="h-40 w-full bg-white rounded-md flex items-center justify-center border border-[#2B3139]">
                    <span className="text-4xl italic text-[#181A20]" style={{ fontFamily: 'serif' }}>
                      {typedSignature || 'Signature Preview'}
                    </span>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">3. Final Confirmation</h3>
              
              <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-5 space-y-4">
                <p className="text-sm font-semibold text-center text-[#FCD535]">Document Signature Preview</p>
                
                <div className="bg-white rounded p-4 flex justify-end">
                  <div className="text-right">
                    <div className="text-[#181A20] text-xs mb-1">Digitally signed by:</div>
                    {signatureDataUrl && (
                      <img src={signatureDataUrl} alt="Signature" className="h-16 object-contain" />
                    )}
                    <div className="text-[#181A20] font-bold text-sm mt-1">{managerName}</div>
                    <div className="text-[#707A8A] text-xs">Mine Manager</div>
                    <div className="text-[#707A8A] text-xs">{format(new Date(), 'dd MMM yyyy, HH:mm O')}</div>
                  </div>
                </div>

                <div className="text-xs text-[#707A8A] leading-relaxed mt-4 pt-4 border-t border-[#2B3139]">
                  By clicking "Sign Document" below, I certify that this document is accurate to the best of my knowledge, and I consent to use this electronic signature as my legal, binding signature for this statutory report under the Mines Act, 1952.
                </div>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="p-6 border-t border-[#2B3139]">
          {step === 1 && (
            <Button 
              className="w-full bg-[#FCD535] text-[#181A20] hover:bg-[#F0B90B]" 
              disabled={!checklistReviewed}
              onClick={handleNextToStep2}
            >
              Continue to Signature <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          
          {step === 2 && (
            <div className="flex w-full space-x-3">
              <Button 
                variant="outline" 
                className="flex-1 border-[#2B3139] text-[#EAECEF] hover:bg-[#2B3139]" 
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button 
                className="flex-1 bg-[#FCD535] text-[#181A20] hover:bg-[#F0B90B]" 
                onClick={handleNextToStep3}
              >
                Preview <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex w-full space-x-3">
              <Button 
                variant="outline" 
                className="flex-1 border-[#2B3139] text-[#EAECEF] hover:bg-[#2B3139]" 
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button 
                className="flex-1 bg-[#FCD535] text-[#181A20] hover:bg-[#F0B90B] font-bold" 
                onClick={handleConfirm}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Sign Document
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
