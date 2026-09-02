import { create } from 'zustand';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  session: any | null;
  user: User | null;
  role: string | null;
  mineId: string | null;
  setAuth: (session: any | null, user: User | null, role: string | null, mineId: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: null,
  mineId: null,
  setAuth: (session, user, role, mineId) => set({ session, user, role, mineId }),
  clearAuth: () => set({ session: null, user: null, role: null, mineId: null }),
}));
