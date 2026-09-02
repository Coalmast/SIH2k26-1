import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

interface AuthContextValue {
  isInitialized: boolean;
}

export const AuthContext = createContext<AuthContextValue>({ isInitialized: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    // 1. Initial session fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const role = session.user.app_metadata?.role || null;
        const mineId = session.user.app_metadata?.mine_id || null;
        const user = { id: session.user.id, email: session.user.email || '' };
        setAuth(session, user, role, mineId);
      } else {
        setAuth(null, null, null, null);
      }
      setIsInitialized(true);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          const role = session.user.app_metadata?.role || null;
          const mineId = session.user.app_metadata?.mine_id || null;
          const user = { id: session.user.id, email: session.user.email || '' };
          setAuth(session, user, role, mineId);
        } else {
          setAuth(null, null, null, null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setAuth]);

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthInit = () => useContext(AuthContext);
