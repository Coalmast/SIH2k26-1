import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  role: string
  // Add other fields from user_metadata if needed
}

interface AuthState {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
}

interface AuthStore {
  auth: AuthState
  setSession: (session: Session | null) => void
  setIsLoading: (isLoading: boolean) => void
  reset: () => void
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true, // Start in loading state until Supabase checks session
}

export const useAuthStore = create<AuthStore>()((set) => ({
  auth: initialState,
  setSession: (session) =>
    set((state) => {
      if (!session) {
        return { auth: { ...state.auth, session: null, user: null, isLoading: false } }
      }

      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        role: session.user.role || 'authenticated',
      }

      return { auth: { ...state.auth, session, user, isLoading: false } }
    }),
  setIsLoading: (isLoading) =>
    set((state) => ({ auth: { ...state.auth, isLoading } })),
  reset: () => set({ auth: { ...initialState, isLoading: false } }),
}))
