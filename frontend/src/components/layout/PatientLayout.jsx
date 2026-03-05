import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Stethoscope } from 'lucide-react'
import LanguageSwitcher from '../ui/LanguageSwitcher'

export default function PatientLayout({ children, showBack = false, backLabel = 'Back', title, currentLang, availableLangs, onLanguageChange }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50">
      {(showBack || title || currentLang) && (
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 h-12 flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0" aria-label={backLabel}>
              <ArrowLeft size={18} />
            </button>
          )}
          {title && <h1 className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">{title}</h1>}
          <div className="ml-auto flex items-center gap-2">
            {currentLang && availableLangs && <LanguageSwitcher current={currentLang} available={availableLangs} onChange={onLanguageChange} size="sm" />}
            <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
              <Stethoscope size={12} />
              <span>Shifa</span>
            </div>
          </div>
        </header>
      )}
      {children}
      <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </div>
  )
}
