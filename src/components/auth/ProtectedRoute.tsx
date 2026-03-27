import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Wraps routes that require authentication.
 * Unauthenticated users are redirected to /auth.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-sm text-slate-400 font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}

/**
 * Wraps auth routes (login/signup).
 * Authenticated users are redirected away to the dashboard.
 */
export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />;
}