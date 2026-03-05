import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/api'
import { formatDistanceToNow } from 'date-fns'

const TYPE_ICON = { MEDICINE_REMINDER: '💊', FOLLOW_UP: '📅', TEST_REMINDER: '🧪', WHATSAPP_FAILED: '⚠️' }

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(false)
  const unread = notifs.filter((n) => !n.readAt).length

  const load = async () => {
    setLoading(true)
    try {
      const d = await getNotifications({ size: 15 })
      setNotifs(d.content ?? d)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])
  useEffect(() => {
    const t = setInterval(load, 60_000)
    return () => clearInterval(t)
  }, [])

  const markOne = async (id) => {
    await markNotificationRead(id)
    setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)))
  }
  const markAll = async () => {
    await markAllNotificationsRead()
    setNotifs((ns) => ns.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })))
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o)
          if (!open) load()
        }}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-30 w-80 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm">Notifications</p>
              {unread > 0 && (
                <button onClick={markAll} className="text-xs text-emerald-600 font-medium hover:text-emerald-700">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {loading && <div className="p-4 text-center text-sm text-gray-400">Loading…</div>}
              {!loading && notifs.length === 0 && (
                <div className="p-6 text-center">
                  <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">All caught up!</p>
                </div>
              )}
              {notifs.map((n) => (
                <div key={n.id} onClick={() => !n.readAt && markOne(n.id)} className={['flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors', !n.readAt ? 'bg-emerald-50/30' : ''].join(' ')}>
                  <span className="text-lg shrink-0">{TYPE_ICON[n.type] ?? '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight ${!n.readAt ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                  </div>
                  {!n.readAt && <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
