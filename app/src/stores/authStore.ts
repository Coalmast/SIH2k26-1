import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';

export type UserRole = 'OVERMAN' | 'WORKER' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  mineId: string | null;
  isBiometricEnabled: boolean;
  isOfflineAuthenticated: boolean;
  
  // Actions
  setAuth: (session: Session | null, user: User | null, role: UserRole | null, mineId: string | null) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setOfflineAuthenticated: (status: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      role: null,
      mineId: null,
      isBiometricEnabled: false,
      isOfflineAuthenticated: false,

      setAuth: (session, user, role, mineId) => set({ session, user, role, mineId }),
      setBiometricEnabled: (isBiometricEnabled) => set({ isBiometricEnabled }),
      setOfflineAuthenticated: (isOfflineAuthenticated) => set({ isOfflineAuthenticated }),
      clearAuth: () => set({ session: null, user: null, role: null, mineId: null, isOfflineAuthenticated: false }),
    }),
    {
      name: 'comet-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
