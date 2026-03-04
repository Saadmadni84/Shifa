import { useState } from 'react'
import { Brain, Pill, Utensils, AlertTriangle, Calendar, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

export default function AISummaryReview({ summary, onApprove, onReprocess, isLoading }) {
  const [open, setOpen] = useState({ meds: true, diet: false, flags: true })
  const tog = (k) => setOpen((s) => ({ ...s, [k]: !s[k] }))
  if (!summary) return null
  const conf = Math.round((summary.confidenceScore ?? 0) * 100)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Brain size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">AI Summary Ready</p>
            <p className="text-xs text-gray-500">Review before sending to patient</p>
          </div>
        </div>
        <Badge variant={conf >= 90 ? 'success' : conf >= 70 ? 'warning' : 'danger'}>{conf}% confidence</Badge>
      </div>
      <div className="p-5 space-y-3">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Diagnosis</p>
          <p className="font-bold text-blue-900">{summary.diagnosis}</p>
          {summary.diagnosisDetails && <p className="text-sm text-blue-700 mt-1 leading-relaxed">{summary.diagnosisDetails}</p>}
          {summary.icdCode && <p className="text-xs text-blue-400 font-mono mt-1.5">ICD-10: {summary.icdCode}</p>}
        </div>
        <Section icon={<Pill size={14} />} title={`Medications (${summary.medications?.length ?? 0})`} iconCls="bg-emerald-50 text-emerald-600" open={open.meds} toggle={() => tog('meds')}>
          {(summary.medications ?? []).map((m, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${m.critical ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                  {m.critical && (
                    <Badge variant="danger" className="text-[10px] py-0 px-1.5">
                      CRITICAL
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{[m.dosage, m.frequency, m.timing, m.durationDays && `${m.durationDays}d`].filter(Boolean).join(' · ')}</p>
                {m.purpose && <p className="text-xs text-gray-500 mt-0.5">For: {m.purpose}</p>}
              </div>
            </div>
          ))}
        </Section>
        <Section icon={<Utensils size={14} />} title="Dietary Advice" iconCls="bg-amber-50 text-amber-600" open={open.diet} toggle={() => tog('diet')}>
          <ul className="space-y-1.5">
            {(summary.dietaryAdvice ?? []).map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                {d}
              </li>
            ))}
          </ul>
        </Section>
        {summary.redFlags?.length > 0 && (
          <Section icon={<AlertTriangle size={14} />} title="Red Flags" iconCls="bg-red-50 text-red-600" open={open.flags} toggle={() => tog('flags')}>
            <ul className="space-y-1.5">
              {summary.redFlags.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="shrink-0 mt-0.5">⚠</span>
                  {f}
                </li>
              ))}
            </ul>
          </Section>
        )}
        {summary.followUpInDays > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
            <Calendar size={16} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800">
              Follow up in <strong>{summary.followUpInDays} days</strong>
            </p>
          </div>
        )}
      </div>
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/30 flex gap-3">
        {onReprocess && (
          <Button variant="secondary" onClick={onReprocess} size="sm" className="flex-1">
            Re-process
          </Button>
        )}
        <Button variant="primary" onClick={onApprove} loading={isLoading} leftIcon={<CheckCircle2 size={15} />} className="flex-1">
          Approve & Send
        </Button>
      </div>
    </div>
  )
}

function Section({ icon, title, iconCls, open, toggle, children }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button type="button" onClick={toggle} className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-center gap-2.5">
          <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconCls}`}>{icon}</span>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-2">{children}</div>}
    </div>
  )
}
