import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Plus, Settings, LogOut, Menu, X, Stethoscope } from 'lucide-react'
import { logout, getCachedUser } from '@/api'
import Avatar from '../ui/Avatar'
import NotificationBell from '../doctor/NotificationBell'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/doctor/dashboard', icon: <LayoutDashboard size={19} />, label: 'Dashboard' },
  { to: '/doctor/patients', icon: <Users size={19} />, label: 'Patients' },
  { to: '/doctor/new-visit', icon: <Plus size={19} />, label: 'New Visit' },
  { to: '/doctor/settings', icon: <Settings size={19} />, label: 'Settings' },
]

const link = (isActive) =>
  [
    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  ].join(' ')

export default function DoctorLayout({ children }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const user = getCachedUser()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out')
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-20">
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-100 shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Stethoscope size={15} className="text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">Shifa</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => link(isActive)}>
              {n.icon}
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar firstName={user?.doctor?.firstName ?? 'D'} lastName={user?.doctor?.lastName ?? 'r'} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                Dr. {user?.doctor?.firstName} {user?.doctor?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.doctor?.specialization ?? 'Doctor'}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 flex items-center gap-3 px-4 h-14">
        <div className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Stethoscope size={13} className="text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">Shifa</span>
        </div>
        <NotificationBell />
        <button onClick={() => setOpen((o) => !o)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setOpen(false)} />
          <div className="fixed top-14 left-0 bottom-0 w-72 bg-white border-r border-gray-200 z-50 lg:hidden animate-in slide-in-from-left duration-200">
            <nav className="p-3 space-y-0.5">
              {NAV.map((n) => (
                <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)} className={({ isActive }) => link(isActive)}>
                  {n.icon}
                  {n.label}
                </NavLink>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={19} />
                Logout
              </button>
            </nav>
          </div>
        </>
      )}

      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen overflow-auto">{children}</main>
    </div>
  )
}
