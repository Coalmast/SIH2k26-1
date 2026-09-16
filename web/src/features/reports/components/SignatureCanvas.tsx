import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { COMET_TOKENS } from '@/lib/design-tokens';

export interface SignatureCanvasRef {
  clear: () => void;
  toDataURL: () => string | null;
  isEmpty: () => boolean;
}

interface SignatureCanvasProps {
  className?: string;
  onBegin?: () => void;
  onEnd?: () => void;
}

export const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  ({ className, onBegin, onEnd }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [empty, setEmpty] = useState(true);

    const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return null;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      let clientX, clientY;
      
      if ('touches' in event) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }
      
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      // Allow touch scrolling on the page when not drawing (prevents page from jumping, though touch-none is set)
      if (e.cancelable) {
        e.preventDefault();
      }
      
      const coords = getCoordinates(e);
      if (!coords || !canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
      if (empty) setEmpty(false);
      if (onBegin) onBegin();
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      if (e.cancelable) {
        e.preventDefault();
      }
      
      const coords = getCoordinates(e);
      if (!coords || !canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (isDrawing && onEnd) {
        onEnd();
      }
      setIsDrawing(false);
    };

    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Use the internal width/height which accounts for DPR
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setEmpty(true);
      },
      toDataURL: () => {
        if (empty || !canvasRef.current) return null;
        return canvasRef.current.toDataURL('image/png');
      },
      isEmpty: () => empty,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Handle high DPI displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = COMET_TOKENS.colors.textPrimaryLight; // Dark ink on light canvas
      ctx.lineWidth = 2.5;
    }, []);

    return (
      <div className={cn("relative w-full h-40 rounded-md border border-border/30 bg-white overflow-hidden", className)}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
          aria-label="Signature Canvas"
        />
        {empty && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-muted-foreground/50 select-none">
            Sign here
          </div>
        )}
      </div>
    );
  }
);

SignatureCanvas.displayName = 'SignatureCanvas';
