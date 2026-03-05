import { Users, Calendar, Send, Eye, Clock, MessageSquare } from 'lucide-react'

const CFG = [
  { key: 'patientsThisMonth', label: 'Patients', sub: 'this month', icon: <Users size={18} />, bg: 'bg-blue-50', text: 'text-blue-600' },
  { key: 'visitsToday', label: 'Visits', sub: 'today', icon: <Calendar size={18} />, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { key: 'summariesSentThisWeek', label: 'Summaries Sent', sub: 'this week', icon: <Send size={18} />, bg: 'bg-amber-50', text: 'text-amber-600' },
  { key: 'whatsappReadThisMonth', label: 'WA Read', sub: 'this month', icon: <Eye size={18} />, bg: 'bg-purple-50', text: 'text-purple-600' },
  { key: 'followUpsTomorrow', label: 'Follow-ups', sub: 'tomorrow', icon: <Clock size={18} />, bg: 'bg-rose-50', text: 'text-rose-600' },
  { key: 'pendingReviews', label: 'Pending Review', sub: 'unsent', icon: <MessageSquare size={18} />, bg: 'bg-indigo-50', text: 'text-indigo-600' },
]

export default function StatsGrid({ stats, isLoading }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {CFG.map((s) => (
        <div key={s.key} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg}`} />
              <div className="h-7 w-12 bg-gray-200 rounded-lg" />
              <div className="h-2.5 w-20 bg-gray-200 rounded-full" />
            </div>
          ) : (
            <>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg} ${s.text}`}>{s.icon}</div>
              <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{stats?.[s.key] ?? 0}</p>
              <p className="text-xs text-gray-500 font-medium leading-tight">
                {s.label}
                <span className="block text-gray-400">{s.sub}</span>
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
