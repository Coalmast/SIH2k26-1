import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type AppRole =
  | 'super_admin'
  | 'corporate_executive'
  | 'mine_manager'
  | 'field_inspector'
  | 'safety_official'
  | 'contractor'

interface AuthUser {
  id: string
  email: string
  role: AppRole | 'authenticated'
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
  user: null,
  session: null,
  isLoading: true,
  role: null,
  permissions: [],
  mineIds: [],
  subsidiaryId: null,
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
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
    
    // Auto fetch roles when session is set
    if (session?.user?.id) {
       get().fetchRoleAndPermissions(session.user.id, session.user.email || '');
    }
  },
  fetchRoleAndPermissions: async (userId: string, email: string) => {
    try {
       // Check user_roles table
       const { data: roleData, error } = await supabase
         .from('user_roles')
         .select('roles(name)')
         .eq('user_id', userId)
         .maybeSingle();
         
       let role: AppRole | null = null;
       
       if (!error && roleData?.roles) {
         role = (roleData.roles as any).name as AppRole;
       }
       
       // Fallback mock based on email for hackathon demo
       if (!role) {
         if (email.includes('admin') || email.includes('super')) role = 'super_admin';
         else if (email.includes('corporate') || email.includes('subsidiary') || email.includes('exec')) role = 'corporate_executive';
         else if (email.includes('manager')) role = 'mine_manager';
         else if (email.includes('inspector') || email.includes('field')) role = 'field_inspector';
         else if (email.includes('safety')) role = 'safety_official';
         else if (email.includes('contractor') || email.includes('vendor')) role = 'contractor';
         else role = 'field_inspector';
       }

       get().setUserMeta(role, [], null);
       
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
      if (role === 'field_inspector') permissions.push('inspection:create', 'violation:create', 'incident:create');
      if (role === 'safety_official') permissions.push('inspection:create', 'violation:create', 'incident:create', 'capa:verify');
      if (role === 'contractor') permissions.push('contractor:view', 'grievance:create');
      
      const user = state.auth.user ? { ...state.auth.user, role } : null;
      
      return { auth: { ...state.auth, user, role, mineIds, subsidiaryId, permissions } };
    }),
  setIsLoading: (isLoading) =>
    set((state) => ({ auth: { ...state.auth, isLoading } })),
  reset: () => set({ auth: { ...initialState, isLoading: false } }),
}))
