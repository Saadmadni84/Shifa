import { Link, useNavigate } from 'react-router-dom'
import { Stethoscope, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { isLoggedIn, getCachedUser } from '@/api'
import Button from '../ui/Button'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()
  const user = getCachedUser()
  const goHome = () => navigate(user?.role === 'DOCTOR' ? '/doctor/dashboard' : '/login')
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
            <Stethoscope size={15} className="text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">Shifa</span>
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium hidden sm:block">India</span>
        </Link>
        <div className="hidden md:flex items-center gap-3">
          {loggedIn ? (
            <Button size="sm" onClick={goHome}>
              Go to App
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </>
          )}
        </div>
        <button onClick={() => setOpen((o) => !o)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-200 px-4 py-3 bg-white flex flex-col gap-2">
          {loggedIn ? (
            <Button fullWidth onClick={goHome}>
              Go to App
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  navigate('/login')
                  setOpen(false)
                }}
              >
                Sign in
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  navigate('/register')
                  setOpen(false)
                }}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
