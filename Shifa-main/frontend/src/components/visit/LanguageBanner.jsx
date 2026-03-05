import { Globe } from 'lucide-react'

export default function LanguageBanner({ currentLang, onSwitchToEnglish, onOpenSwitcher }) {
  if (currentLang === 'en') return null
  return (
    <div className="mx-4 bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-start gap-3">
      <Globe size={18} className="text-blue-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-blue-800 leading-relaxed">This summary was generated in your preferred language. If anything seems unclear, you can switch below.</p>
        <div className="flex items-center gap-3 mt-2">
          <button onClick={onSwitchToEnglish} className="text-xs font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors">
            Read in English
          </button>
          {onOpenSwitcher && (
            <button onClick={onOpenSwitcher} className="text-xs font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800">
              Other languages →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
