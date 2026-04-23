'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/' 
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to landing page if not authenticated and trying to access protected route
        router.push(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        // Redirect authenticated users away from login/register pages
        if (pathname === '/login' || pathname === '/register') {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router, pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-4">Please log in to access this page.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Don't render login/register if already authenticated
  if (!requireAuth && isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}