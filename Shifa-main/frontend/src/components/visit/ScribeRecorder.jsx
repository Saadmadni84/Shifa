import { useState, useRef, useCallback } from 'react'
import { Mic, Square, Upload, CheckCircle2, Clock } from 'lucide-react'
import Button from '../ui/Button'

const STEPS = { CONSENT: 'consent', RECORDING: 'recording', DONE: 'done' }

export default function ScribeRecorder({ onAudioReady, onCancel }) {
  const [step, setStep] = useState(STEPS.CONSENT)
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState(null)

  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      chunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: 'audio/webm' })
        setBlob(b)
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start(1000)
      mediaRef.current = mr
      setStep(STEPS.RECORDING)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      alert('Microphone access required to record a visit.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current)
    mediaRef.current?.stop()
    setStep(STEPS.DONE)
  }, [])

  const handleProcess = () => {
    if (blob) onAudioReady?.(blob)
  }

  if (step === STEPS.CONSENT)
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-sm mx-auto text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-3xl">🎙️</div>
        <div>
          <h2 className="font-bold text-gray-900 text-lg mb-2">Record Your Visit</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Both the <strong>doctor and patient</strong> must consent to this recording. It will be processed by AI to generate your visit summary.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-left">
          <p className="text-xs text-amber-800 leading-relaxed">
            ✓ Recording is for medical summarisation only
            <br />✓ Audio is securely stored and encrypted
            <br />✓ Only shared with your doctor
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={startRecording} leftIcon={<Mic size={16} />} className="flex-1">
            Start Recording
          </Button>
        </div>
      </div>
    )

  if (step === STEPS.RECORDING)
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-sm mx-auto text-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 bg-red-100 rounded-full animate-ping opacity-50" />
          <div className="absolute w-20 h-20 bg-red-100 rounded-full animate-ping opacity-30" style={{ animationDelay: '300ms' }} />
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center relative z-10">
            <Mic size={28} className="text-white" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 font-mono tracking-wider">{fmt(seconds)}</p>
          <p className="text-sm text-red-500 font-medium mt-1 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Recording…
          </p>
        </div>
        <Button variant="danger" onClick={stopRecording} leftIcon={<Square size={16} />} fullWidth>
          Stop Recording
        </Button>
      </div>
    )

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-sm mx-auto text-center space-y-5">
      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
        <CheckCircle2 size={32} className="text-emerald-500" />
      </div>
      <div>
        <h2 className="font-bold text-gray-900">Recording Complete</h2>
        <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1.5">
          <Clock size={13} /> Duration: {fmt(seconds)}
        </p>
      </div>
      <Button variant="primary" onClick={handleProcess} leftIcon={<Upload size={16} />} fullWidth>
        Process Visit
      </Button>
      <button onClick={() => setStep(STEPS.CONSENT)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
        Re-record
      </button>
    </div>
  )
}
