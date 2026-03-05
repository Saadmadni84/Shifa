/**
 * ProtectedRoute.jsx — Authentication & role guard
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage:
 *   <ProtectedRoute requiredRole="DOCTOR">
 *     <SomePage />
 *   </ProtectedRoute>
 *
 * Behaviour:
 *   1. If not authenticated → redirect to /login with { from, returnTo } state
 *   2. If authenticated but wrong role → redirect to /unauthorized
 *   3. If token is present but no user object yet (rehydrating) → show spinner
 *   4. If all checks pass → render children
 *
 * The returnTo mechanism:
 *   After login, LoginPage reads location.state.returnTo and redirects the
 *   doctor back to the page they were trying to reach.
 */

import { useEffect }          from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore }       from '@/store'
import { PageLoader }         from '@/components/ui/Spinner'

export default function ProtectedRoute({ children, requiredRole }) {
  const location                       = useLocation()
  const { user, token, isAuthenticated } = useAuthStore()

  // ── Case 1: Token exists but user not yet rehydrated from localStorage ──
  // This happens for ~1 frame on hard refresh. Show spinner, don't redirect.
  if (token && !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--color-bg)]">
        <PageLoader />
      </div>
    )
  }

  // ── Case 2: Not authenticated at all ───────────────────────────────────
  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:     location.pathname,
          returnTo: location.pathname + location.search,
          message:  'Please sign in to continue.',
        }}
      />
    )
  }

  // ── Case 3: Wrong role ─────────────────────────────────────────────────
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ attempted: location.pathname, role: user?.role }}
      />
    )
  }

  // ── Case 4: All good ───────────────────────────────────────────────────
  return children
}

/**
 * GuestOnlyRoute — opposite of ProtectedRoute.
 * Redirects authenticated users away from /login and /register.
 *
 * Usage:
 *   <GuestOnlyRoute>
 *     <LoginPage />
 *   </GuestOnlyRoute>
 */
export function GuestOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated()) {
    const dest = user?.role === 'DOCTOR' ? '/doctor/dashboard' : '/'
    return <Navigate to={dest} replace />
  }

  return children
}
