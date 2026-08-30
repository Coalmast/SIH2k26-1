import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface UserFilters {
  page?: number;
  pageSize?: number;
  status?: string[];
  role?: string[];
  username?: string;
}

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select(`
          id, keycloak_subject, full_name, email, designation, is_active, created_at,
          user_roles (
            roles ( name )
          )
        `);

      if (filters.status && filters.status.length > 0) {
        query = query.in('is_active', filters.status.map(s => s === 'active'));
      }

      // Supabase PostgREST currently doesn't easily filter by nested array of relation exactly with `.in` 
      // without inner joins. For simplicity in the dashboard, we fetch all and filter in JS 
      // or we just fetch top level and rely on a view. 
      // We will fetch and transform to match our `User` schema.
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform to match frontend schema
      let users = data.map((u: any) => ({
        id: u.id,
        keycloak_subject: u.keycloak_subject,
        full_name: u.full_name,
        email: u.email,
        designation: u.designation,
        is_active: u.is_active,
        created_at: u.created_at,
        roles: u.user_roles?.map((ur: any) => ur.roles?.name) || [],
      }));
      
      if (filters.role && filters.role.length > 0) {
        users = users.filter((u: any) => u.roles.some((r: string) => filters.role!.includes(r)));
      }
      
      if (filters.username && filters.username.trim() !== '') {
        const search = filters.username.toLowerCase();
        users = users.filter((u: any) => 
          u.full_name.toLowerCase().includes(search) || 
          (u.email && u.email.toLowerCase().includes(search))
        );
      }

      return users;
    }
  });
}
