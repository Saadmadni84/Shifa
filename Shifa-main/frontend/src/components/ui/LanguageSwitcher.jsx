import { useState } from 'react'
import { Globe } from 'lucide-react'

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
]

export default function LanguageSwitcher({ current = 'hi', available = ['en', 'hi'], onChange, size = 'md' }) {
  const [open, setOpen] = useState(false)
  const cur = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0]
  const opts = LANGUAGES.filter((l) => available.includes(l.code))
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400',
          size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        ].join(' ')}
      >
        <Globe size={size === 'sm' ? 13 : 15} className="text-emerald-500" />
        <span>{cur.native}</span>
        <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-20 bg-white rounded-xl border border-gray-200 shadow-lg py-1 min-w-[170px] animate-in fade-in zoom-in-95 duration-150">
            {opts.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  onChange?.(l.code)
                  setOpen(false)
                }}
                className={['w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors', l.code === current ? 'text-emerald-600 font-semibold' : 'text-gray-700'].join(' ')}
              >
                <span>{l.native}</span>
                <span className="text-xs text-gray-400 ml-4">{l.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
