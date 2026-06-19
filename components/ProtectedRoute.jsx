'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * ProtectedRoute - Wraps routes that require authentication and specific role
 * @param {string} role - Required role ('student' | 'faculty'). If omitted, any authenticated user can access.
 */
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (role && user?.role !== role) {
        // Redirect to the correct dashboard if role doesn't match
        const redirectTo = user?.role === 'faculty' ? '/faculty/dashboard' : '/dashboard';
        router.replace(redirectTo);
      }
    }
  }, [isAuthenticated, user, loading, role, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Prevent children rendering during redirect check
  if (!isAuthenticated || (role && user?.role !== role)) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
