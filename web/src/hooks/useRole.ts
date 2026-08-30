import { useAuthStore, AppRole } from '../stores/auth-store';

export function useRole(): AppRole | null {
  return useAuthStore((state) => state.auth.role);
}
