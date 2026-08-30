import React from 'react';
import { useRole } from '../../hooks/useRole';
import { AppRole } from '../../stores/auth-store';

interface RoleGuardProps {
  roles: AppRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const currentRole = useRole();
  
  if (!currentRole) return <>{fallback}</>;
  
  if (currentRole === 'system_admin' || roles.includes(currentRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
