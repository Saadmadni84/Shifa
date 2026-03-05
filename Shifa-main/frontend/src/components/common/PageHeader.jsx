import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, subtitle, action, backHref, className = '' }) {
  const navigate = useNavigate()
  return (
    <div className={`flex items-start justify-between px-6 py-5 bg-white border-b border-gray-200 ${className}`}>
      <div className="flex items-start gap-3">
        {backHref && (
          <button onClick={() => (backHref === -1 ? navigate(-1) : navigate(backHref))} className="mt-0.5 p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors shrink-0" aria-label="Back">
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0 ml-4 mt-0.5">{action}</div>}
    </div>
  )
}
