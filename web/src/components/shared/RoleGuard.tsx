import React from 'react';

import { Loader2 } from 'lucide-react';
import { useAuthStore, type AppRole } from '../../stores/auth-store';

interface RoleGuardProps {
  roles: AppRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { role: currentRole, isLoading } = useAuthStore((state) => state.auth);
  
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!currentRole) return <>{fallback}</>;
  
  if (currentRole === 'super_admin' || roles.includes(currentRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
