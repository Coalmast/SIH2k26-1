import React, { useState, useEffect } from 'react';
import { ServerOff, Database, X } from 'lucide-react';
import { DEMO_MODE } from '@/lib/demo-mode';
import { motion, AnimatePresence } from 'framer-motion';

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (DEMO_MODE) {
      const dismissed = sessionStorage.getItem('demo-banner-dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('demo-banner-dismissed', 'true');
  };

  if (!DEMO_MODE) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg"
        >
          <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg border border-destructive/20 flex items-center gap-3 backdrop-blur-md bg-destructive/95">
            <div className="flex -space-x-2">
              <div className="bg-background/20 p-1.5 rounded-full ring-2 ring-destructive">
                <ServerOff className="w-4 h-4" />
              </div>
              <div className="bg-background/20 p-1.5 rounded-full ring-2 ring-destructive">
                <Database className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1 text-sm font-medium leading-tight">
              Backend API & Database are offline
              <div className="text-xs opacity-90 mt-0.5 font-normal">Running in local demo mode. Demo data is seeded.</div>
            </div>
            
            <button 
              onClick={handleDismiss}
              className="p-1 hover:bg-background/20 rounded-md transition-colors shrink-0 cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
