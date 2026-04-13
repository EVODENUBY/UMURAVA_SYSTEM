"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ROLES } from '@/lib/types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      router.push(getRedirectForRole(user.role));
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

function getRedirectForRole(role: UserRole): string {
  switch (role) {
    case ROLES.APPLICANT:
      return '/applicant';
    case ROLES.RECRUITER:
      return '/recruiter';
    case ROLES.ADMIN:
      return '/admin';
    default:
      return '/login';
  }
}
