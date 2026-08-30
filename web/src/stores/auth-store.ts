import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type AppRole =
  | 'field_officer'
  | 'mine_manager'
  | 'safety_officer'
  | 'environmental_officer'
  | 'compliance_officer'
  | 'contractor_manager'
  | 'subsidiary_admin'
  | 'corporate_executive'
  | 'regulator'
  | 'system_admin'

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
         if (email.includes('admin')) role = 'system_admin';
         else if (email.includes('manager')) role = 'mine_manager';
         else if (email.includes('safety')) role = 'safety_officer';
         else if (email.includes('compliance')) role = 'compliance_officer';
         else if (email.includes('regulator')) role = 'regulator';
         else if (email.includes('corporate')) role = 'corporate_executive';
         else if (email.includes('sub')) role = 'subsidiary_admin';
         else role = 'field_officer';
       }

       get().setUserMeta(role, [], null);
       
    } catch (err) {
       console.error("Failed to fetch role", err);
    }
  },
  setUserMeta: (role, mineIds, subsidiaryId) =>
    set((state) => {
      const permissions: string[] = [];
      if (role === 'system_admin') permissions.push('all');
      if (role === 'mine_manager') permissions.push('compliance:approve', 'capa:verify', 'mine:write');
      if (role === 'safety_officer') permissions.push('inspection:create', 'violation:create', 'incident:create');
      if (role === 'compliance_officer') permissions.push('compliance:approve', 'ocr:review');
      
      const user = state.auth.user ? { ...state.auth.user, role } : null;
      
      return { auth: { ...state.auth, user, role, mineIds, subsidiaryId, permissions } };
    }),
  setIsLoading: (isLoading) =>
    set((state) => ({ auth: { ...state.auth, isLoading } })),
  reset: () => set({ auth: { ...initialState, isLoading: false } }),
}))
