import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VoiceInput({ onTranscript, language = 'en-IN', disabled = false }) {
  const [on, setOn] = useState(false)
  const rRef = useRef(null)
  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const stop = useCallback(() => {
    if (rRef.current) {
      rRef.current.onend = null
      rRef.current.stop()
      rRef.current = null
    }
    setOn(false)
  }, [])

  const start = useCallback(() => {
    if (!supported || disabled) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = language
    r.onresult = (e) => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const t = e.results[i][0].transcript
        e.results[i].isFinal ? (final += `${t} `) : (interim += t)
      }
      if (final) onTranscript?.(final.trim(), true)
      if (interim) onTranscript?.(interim.trim(), false)
    }
    r.onerror = (e) => {
      if (e.error === 'not-allowed') toast.error('Microphone access denied.')
      stop()
    }
    r.onend = () => {
      if (rRef.current) r.start()
    }
    r.start()
    rRef.current = r
    setOn(true)
    toast.success('🎙️ Recording started', { duration: 1500 })
  }, [supported, disabled, language, onTranscript, stop])

  if (!supported) return null
  return (
    <button
      type="button"
      onClick={on ? stop : start}
      disabled={disabled}
      className={[
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        on ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 focus-visible:ring-red-400' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 focus-visible:ring-emerald-400',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      {on ? (
        <>
          <MicOff size={14} />
          <span>Stop</span>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </>
      ) : (
        <>
          <Mic size={14} />
          <span>Voice</span>
        </>
      )}
    </button>
  )
}
