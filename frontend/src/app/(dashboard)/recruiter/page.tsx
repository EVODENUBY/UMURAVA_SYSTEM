"use client";

import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/lib/types';

export default function RecruiterPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-[60vh]">Please login to access recruiter</div>;
  }

  if (user?.role !== ROLES.RECRUITER && user?.role !== ROLES.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-slate-500 mt-2">You need recruiter role to view this page</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900">
        Welcome to Recruiter
      </h1>
      <p className="text-slate-500 mt-4 max-w-md">
        Hello, {user.fullName || 'Recruiter'}! This is the recruiter dashboard. 
        Full recruiter features coming soon.
      </p>
      <div className="mt-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100">
        <p className="text-sm text-emerald-600 font-medium">
          Role: {user.role || 'Recruiter'}
        </p>
      </div>
    </div>
  );
}