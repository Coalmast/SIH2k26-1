import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { DEMO_MODE, DEMO_SESSION } from '@/lib/demo-mode'

export type AppRole =
  | 'super_admin'
  | 'corporate_executive'
  | 'mine_manager'
  | 'field_inspector'
  | 'safety_official'
  | 'contractor'
  | 'regulator'
  | 'subsidiary_admin'

interface AuthUser {
  id: string
  email: string
  role: AppRole | 'authenticated'
  mineIds?: string[]
  full_name?: string
}

interface AuthState {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  role: AppRole | null
  permissions: string[]
  mineIds: string[]
  subsidiaryId: string | null
}

interface AuthStore {
  auth: AuthState
  setSession: (session: Session | null) => void
  setUserMeta: (role: AppRole, mineIds: string[], subsidiaryId: string | null) => void
  setIsLoading: (isLoading: boolean) => void
  fetchRoleAndPermissions: (userId: string, email: string) => Promise<void>
  reset: () => void
}

const initialState: AuthState = {
  ...(DEMO_MODE ? {
    user: {
      id: 'demo-user-001',
      email: 'demo@coalindia.gov.in',
      role: 'authenticated' as const,
      full_name: 'Demo User — SIH 2026',
    },
    session: DEMO_SESSION as any,
    role: null,
    isLoading: false,
    permissions: [],
    mineIds: ['mine-001', 'mine-002', 'mine-003'],
    subsidiaryId: 'sub-001',
  } : {
    user: null,
    session: null,
    isLoading: true,
    role: null,
    permissions: [],
    mineIds: [],
    subsidiaryId: null,
  })
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
  auth: initialState,
  setSession: (session) => {
    set((state) => {
      if (!session) {
        return { auth: { ...state.auth, session: null, user: null, role: null, permissions: [], mineIds: [], subsidiaryId: null, isLoading: false } }
      }

      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        role: state.auth.role || 'authenticated',
      }

      return { auth: { ...state.auth, session, user, isLoading: false } }
    })
    
    // Auto fetch roles when session is set if role isn't already set
    if (session?.user?.id && !get().auth.role) {
       get().fetchRoleAndPermissions(session.user.id, session.user.email || '');
    }
  },
  fetchRoleAndPermissions: async (userId: string, email: string) => {
    try {
       const currentRole = get().auth.role;

       // Check user_roles table
       let roleData: any = null;
       let error: any = null;
       
       if (!DEMO_MODE) {
         const result = await supabase
           .from('user_roles')
           .select('roles(name)')
           .eq('user_id', userId)
           .maybeSingle();
         roleData = result.data;
         error = result.error;
       }
         
       let role: AppRole | null = null;
       
       if (!error && roleData?.roles) {
         role = (roleData.roles as any).name as AppRole;
       }
       
       // Preserve active user role if DB doesn't have an explicit entry
       if (!role && currentRole) {
         role = currentRole;
       }

       // Fallback mock based on email for hackathon demo
       if (!role) {
         if (email.includes('admin') || email.includes('super')) role = 'super_admin';
         else if (email.includes('corporate') || email.includes('subsidiary') || email.includes('exec')) role = 'corporate_executive';
         else if (email.includes('manager')) role = 'mine_manager';
         else if (email.includes('inspector') || email.includes('field')) role = 'field_inspector';
         else if (email.includes('safety')) role = 'safety_official';
         else if (email.includes('contractor') || email.includes('vendor')) role = 'contractor';
         else if (email.includes('regulator') || email.includes('dgms')) role = 'regulator';
         else role = 'mine_manager';
       }

       get().setUserMeta(role, get().auth.mineIds || [], get().auth.subsidiaryId || null);
       
    } catch (err) {
       console.error("Failed to fetch role", err);
    }
  },
  setUserMeta: (role, mineIds, subsidiaryId) =>
    set((state) => {
      const permissions: string[] = [];
      if (role === 'super_admin') permissions.push('all');
      if (role === 'corporate_executive') permissions.push('compliance:view', 'reports:view', 'mine:read');
      if (role === 'mine_manager') permissions.push('compliance:approve', 'capa:verify', 'mine:write', 'reports:view');
      if (role === 'field_inspector') permissions.push('inspection:create', 'violation:create', 'incident:create', 'compliance:view');
      if (role === 'safety_official') permissions.push('inspection:create', 'violation:create', 'incident:create', 'capa:verify');
      if (role === 'contractor') permissions.push('contractor:view');
      
      const user = state.auth.user ? { ...state.auth.user, role } : null;
      
      return { auth: { ...state.auth, user, role, mineIds, subsidiaryId, permissions } };
    }),
  setIsLoading: (isLoading) =>
    set((state) => ({ auth: { ...state.auth, isLoading } })),
  reset: () => set({ auth: { ...initialState, isLoading: false } }),
}), {
  name: 'auth-storage',
  partialize: (state) => ({ auth: state.auth }),
}))
