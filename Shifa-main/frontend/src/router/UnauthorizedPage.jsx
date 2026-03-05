/**
 * UnauthorizedPage.jsx — 403 access-denied screen
 * ─────────────────────────────────────────────────────────────────────────────
 * Shown when an authenticated user tries to access a route their role
 * doesn't allow (e.g. a patient trying to open /doctor/dashboard).
 *
 * Route: /unauthorized  (registered in AppRouter.jsx)
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { ShieldAlert }              from 'lucide-react'
import { useAuthStore }             from '@/store'

export default function UnauthorizedPage() {
  const navigate          = useNavigate()
  const { state }         = useLocation()
  const { user, logout }  = useAuthStore()

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-5">
        <ShieldAlert size={28} className="text-red-500" />
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-1">
        Your account doesn't have permission to view this page.
      </p>
      {state?.attempted && (
        <p className="text-xs text-gray-400 mb-6 font-mono bg-gray-100 px-2 py-1 rounded">
          {state.attempted}
        </p>
      )}
      {!state?.attempted && <div className="mb-6" />}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Go back
        </button>
        {user?.role === 'DOCTOR' ? (
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="px-5 py-2.5 text-sm font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Go to Dashboard
          </button>
        ) : (
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="px-5 py-2.5 text-sm font-semibold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Sign in with correct account
          </button>
        )}
      </div>
      <div className="mt-8 text-xs text-gray-400">
        Logged in as <span className="font-semibold">{user?.email}</span>
        {user?.role && <span> ({user.role.toLowerCase()})</span>}
      </div>
    </div>
  )
}
