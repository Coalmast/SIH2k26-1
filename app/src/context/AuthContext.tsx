import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { registerAndSyncPushToken } from '../lib/notifications';

interface AuthContextValue {
  isInitialized: boolean;
}

export const AuthContext = createContext<AuthContextValue>({ isInitialized: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    // In demo mode, we strictly rely on the Zustand store for auth state,
    // not the global supabase client, because our demo users don't exist
    // in the real Supabase GoTrue database and would trigger 403 errors.
    
    const { session } = useAuthStore.getState();
    if (session?.access_token) {
      const apiBase = (global as any).DEV_API_URL || process.env.EXPO_PUBLIC_API_URL || '';
      registerAndSyncPushToken(apiBase, session.access_token).catch(console.error);
    }
    
    // Just mark as initialized since Zustand handles persistence.
    setIsInitialized(true);
  }, []);

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthInit = () => useContext(AuthContext);
