import { Info } from 'lucide-react'
import MedicalTermHighlight from './MedicalTermHighlight'

export default function QuickSummary({ summary, terms = [], onTermClick }) {
  if (!summary) return null
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <Info size={14} className="text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Quick Summary</p>
          <p className="text-sm text-emerald-900 leading-relaxed">
            {terms.length > 0 ? (
              <MedicalTermHighlight
                text={summary}
                terms={terms}
                onTermClick={onTermClick}
                highlightColor="text-emerald-700 underline decoration-emerald-500 decoration-dotted underline-offset-2"
              />
            ) : (
              summary
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
