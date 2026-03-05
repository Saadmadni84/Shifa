import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import MedicalTermHighlight from './MedicalTermHighlight'

const SECTION_META = {
  chiefComplaint: { emoji: '💬', label: 'Chief Complaint' },
  historyOfPresentIllness: { emoji: '🕐', label: 'History of Present Illness' },
  reviewOfSystems: { emoji: '📋', label: 'Reported Symptoms' },
  physicalExam: { emoji: '❤️', label: 'Physical Examination' },
  assessment: { emoji: '🏥', label: 'Assessment' },
  plan: { emoji: '⭐', label: 'Plan' },
  followUp: { emoji: '📅', label: 'Follow-up' },
}

export default function SOAPSection({ sectionKey, content, terms = [], onAskAbout, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const meta = SECTION_META[sectionKey] ?? { emoji: '📝', label: sectionKey }

  if (!content) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg leading-none">{meta.emoji}</span>
          <h3 className="font-semibold text-gray-800 text-sm">{meta.label}</h3>
        </div>

        <div className="flex items-center gap-3">
          {onAskAbout && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onAskAbout(meta.label)
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <span className="text-emerald-500 text-base leading-none">✓✓</span> Ask
            </button>
          )}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100">
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {terms.length > 0 ? <MedicalTermHighlight text={content} terms={terms} onTermClick={(t) => onAskAbout?.(`Explain: ${t.term}`)} /> : content}
          </div>
        </div>
      )}
    </div>
  )
}
