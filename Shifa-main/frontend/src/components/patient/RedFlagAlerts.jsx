import { AlertTriangle, Phone } from 'lucide-react'

export default function RedFlagAlerts({ redFlags = [], doctorPhone, clinicName }) {
  if (!redFlags.length) return null
  return (
    <div className="px-4 py-2 space-y-3">
      <div className="bg-red-600 rounded-2xl p-5 text-white shadow-lg shadow-red-200">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div>
            <p className="font-bold text-base">Seek Urgent Help If:</p>
            <p className="text-red-200 text-xs">Go to emergency or call doctor immediately</p>
          </div>
        </div>
        <ul className="space-y-2">
          {redFlags.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-red-100">
              <span className="mt-0.5 text-red-300 shrink-0 font-bold">⚠</span>
              <span className="leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>
      </div>
      {doctorPhone && (
        <a href={`tel:${doctorPhone}`} className="flex items-center justify-center gap-2.5 border-2 border-red-200 bg-red-50 rounded-2xl p-4 text-red-700 font-bold text-base hover:bg-red-100 active:scale-[0.98] transition-all">
          <Phone size={20} />
          Call {clinicName ?? 'Your Doctor'}
        </a>
      )}
      <a href="tel:112" className="flex items-center justify-center gap-2.5 bg-red-600 text-white rounded-2xl p-3.5 font-bold hover:bg-red-700 active:scale-[0.98] transition-all shadow-sm">
        🚨 Emergency: 112
      </a>
      <p className="text-center text-xs text-gray-400 px-4 leading-relaxed">This information does not replace professional medical advice. When in doubt, contact your doctor.</p>
    </div>
  )
}
