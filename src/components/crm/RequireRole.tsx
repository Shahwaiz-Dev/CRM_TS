import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface RequireRoleProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
} 