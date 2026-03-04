import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

const STEPS = [
  { id: 'transcribe', label: 'Transcribing audio', icon: '🎙️', durationMs: 8000 },
  { id: 'structure', label: 'Structuring clinical data', icon: '📋', durationMs: 5000 },
  { id: 'soap', label: 'Generating SOAP notes', icon: '🩺', durationMs: 10000 },
  { id: 'terms', label: 'Extracting medical terms', icon: '🔬', durationMs: 4000 },
  { id: 'summary', label: 'Creating patient summary', icon: '📝', durationMs: 6000 },
  { id: 'translate', label: 'Translating to your language', icon: '🌐', durationMs: 4000 },
]

export default function AIProcessingStatus({ visitStatus, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (visitStatus === 'REVIEWED' || visitStatus === 'SENT_TO_PATIENT') {
      setCurrentStep(STEPS.length)
      onComplete?.()
      return
    }
    if (visitStatus !== 'AI_PROCESSING') return
    let elapsed = 0
    const timers = STEPS.map((step, i) => {
      elapsed += step.durationMs
      return setTimeout(() => setCurrentStep(i + 1), elapsed)
    })
    return () => timers.forEach(clearTimeout)
  }, [visitStatus, onComplete])

  const isDone = visitStatus === 'REVIEWED' || visitStatus === 'SENT_TO_PATIENT'

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center p-6">
      <div className="relative mb-8">
        <div className="absolute inset-0 w-24 h-24 bg-emerald-200 rounded-full animate-ping opacity-30" />
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center relative text-4xl">🧠</div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">AI is processing your visit</h1>
      <p className="text-sm text-gray-500 mb-10 text-center">Powered by Claude · This takes about 30–60 seconds</p>

      <div className="w-full max-w-sm space-y-3">
        {STEPS.map((step, i) => {
          const done = i < currentStep || isDone
          const active = i === currentStep && !isDone
          return (
            <div
              key={step.id}
              className={[
                'flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500',
                done ? 'bg-white border-emerald-200 shadow-sm' : active ? 'bg-white border-emerald-300 shadow-md ring-1 ring-emerald-200' : 'bg-white/50 border-gray-200',
              ].join(' ')}
            >
              <span className={`text-xl transition-all duration-300 ${done || active ? '' : 'opacity-30'}`}>{step.icon}</span>
              <p className={`flex-1 text-sm font-medium transition-colors duration-300 ${done ? 'text-emerald-700' : active ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
              {done && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
              {active && <Loader2 size={18} className="text-emerald-500 animate-spin shrink-0" />}
            </div>
          )
        })}
      </div>

      {isDone && (
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p className="text-lg font-bold text-emerald-700 mb-1">✅ Ready!</p>
          <p className="text-sm text-gray-500">Your visit summary is ready to review.</p>
        </div>
      )}
    </div>
  )
}
