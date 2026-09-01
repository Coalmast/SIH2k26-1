import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({ session: null, isLoading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check stored session (offline restore)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          // Extract role from JWT app_metadata / user_metadata
          const role = session.user.app_metadata?.role;
          const mineId = session.user.app_metadata?.mine_id;
          // Store session for offline restore
          await SecureStore.setItemAsync('supabase_session', JSON.stringify(session));
        } else {
          await SecureStore.deleteItemAsync('supabase_session');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
