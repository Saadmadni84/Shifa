import { useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store'
import LoginForm from '@/components/forms/LoginForm'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  const sessionExpired = location.state?.sessionExpired

  useEffect(() => {
    if (isAuthenticated?.()) {
      navigate(user?.role === 'DOCTOR' ? '/doctor/dashboard' : '/', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-2">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M4 14L11 21L24 7" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-3xl font-bold text-gray-900 tracking-tight">
          shifa<span className="text-emerald-500">.ai</span>
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-8">Your AI-powered medical visit companion</p>

      <div className="w-full max-w-sm">

        {/* Demo box */}
        <div className="border-2 border-emerald-400 rounded-2xl p-5 mb-6 text-center">
          <p className="text-xs font-bold tracking-widest text-gray-700 mb-1">TRY THE DEMO</p>
          <p className="text-sm text-gray-500 mb-4">No account needed — explore as patient or doctor</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/demo/scenarios')}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
            >
              Sign in as Patient
            </button>
            <button
              onClick={() => navigate('/demo/doctor')}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              Sign in as Doctor
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium tracking-widest">OR SIGN IN</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Session expired banner */}
        {sessionExpired && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <AlertCircle size={15} className="text-amber-500 flex-shrink-0" />
            <p className="text-amber-700 text-sm">Your session expired. Please sign in again.</p>
          </div>
        )}

        {/* Login form */}
        <LoginForm
          onSuccess={(role) => {
            navigate(role === 'DOCTOR' ? '/doctor/dashboard' : '/', { replace: true })
          }}
        />

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <p className="text-xs text-gray-300 mt-10">Powered by Claude Opus 4.5</p>
    </div>
  )
}
