import { useNavigate } from 'react-router-dom'
import { demoPatients } from '@/data/demo/demoData'

// Language code → short label shown on card badge
const LANG_SHORT = { Hindi: 'HI', Gujarati: 'GU', Tamil: 'TA', Telugu: 'TE', Bengali: 'BN', Marathi: 'MR', English: 'EN' }
const AVATAR_GRADIENTS = ['from-emerald-400 to-emerald-600', 'from-indigo-400 to-indigo-600', 'from-amber-400 to-amber-600']

export default function ScenarioPickerPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center px-4 py-12">

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M5 18L14 27L31 9" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 className="text-3xl font-bold text-gray-900">Select Demo Scenario</h1>
      </div>
      <p className="text-gray-500 text-sm text-center max-w-lg mb-10">
        Select a patient to start a demo session. Each scenario loads a realistic visit transcript and clinical data relevant to the individual pathology.
      </p>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-4xl">
        {demoPatients.map((p, idx) => {
          const visit = p.visits?.[0]
          const language = p.language || 'English'
          const langBadge = LANG_SHORT[language] ?? language.slice(0, 2).toUpperCase()
          const grad = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
          const num = String(idx + 1).padStart(2, '0')
          const initials = (p.name || 'P').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()

          return (
            <button
              key={p.id}
              onClick={() => navigate(`/demo/patient/${p.id}/visit/${visit?.id || ''}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all text-left group"
            >
              {/* Avatar area */}
              <div className={`relative h-52 bg-gradient-to-br ${grad} flex items-center justify-center`}>
                {/* Big initials avatar */}
                <span className="text-6xl font-black text-white/30 select-none">{initials}</span>
                <span className="absolute inset-0 flex items-center justify-center text-5xl font-extrabold text-white tracking-widest select-none">
                  {initials}
                </span>

                {/* Language badge — top right */}
                <span className="absolute top-3 right-3 bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {langBadge}
                </span>

                {/* Specialty tag — bottom left */}
                <span className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded capitalize">
                  {p.condition}
                </span>
              </div>

              {/* Card body */}
              <div className="p-4">
                <p className="text-sm font-bold text-gray-900 mb-0.5">
                  {num} — {p.name}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {p.age} years
                </p>
                <p className="text-xs text-emerald-600 italic leading-relaxed line-clamp-2">
                  {visit?.diagnosis || p.condition}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 text-center max-w-lg mt-10">
        All patient data is fictional and created for demonstration purposes only.
      </p>
      <button
        onClick={() => navigate('/login')}
        className="mt-4 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        ← Back to Sign In
      </button>
    </div>
  )
}
