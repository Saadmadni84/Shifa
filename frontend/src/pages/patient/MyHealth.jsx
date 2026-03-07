import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, FileText, LogOut, Phone, UserCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store'

export default function MyHealth() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const firstName = useMemo(() => {
    const display = user?.displayName || ''
    return display.split(' ')[0] || 'Patient'
  }, [user?.displayName])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-emerald-600 font-semibold">Welcome back</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Hi, {firstName}</h1>
          <p className="text-sm text-gray-500 mt-2">
            Your patient dashboard is now connected to login.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <p className="text-xs uppercase tracking-wide text-gray-500">Profile</p>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <UserCircle2 size={16} className="text-gray-500" />
                  <span>{user?.displayName || 'Not available'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  <span>{user?.phoneNumber || 'Not available'}</span>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <p className="text-xs uppercase tracking-wide text-gray-500">Quick Actions</p>
              <div className="mt-3 grid gap-2">
                <button
                  onClick={() => navigate('/')}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                >
                  <CalendarDays size={16} />
                  Home
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white transition-colors"
                >
                  <FileText size={16} />
                  Open Via Doctor Link
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
