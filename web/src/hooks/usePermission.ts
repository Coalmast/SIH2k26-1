import { useAuthStore } from '../stores/auth-store';

export function usePermission(resource: string, action: string): boolean {
  const permissions = useAuthStore((state) => state.auth.permissions);
  if (permissions.includes('all')) return true;
  return permissions.includes(`${resource}:${action}`);
}
