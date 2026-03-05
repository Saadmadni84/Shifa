import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X, Maximize2, Minimize2 } from 'lucide-react'
import { DotPulse } from '../ui/Spinner'

const SUGGESTED = [
  'What happened during my last visit?',
  'What was discussed?',
  'What was the conclusion?',
  'Explain my medication and side effects',
  'What should I watch out for at home?',
  'Can I drink alcohol with my medication?',
]

export default function ChatPanel({ visitId, initialContext, apiBaseUrl = '/api/v1', onClose, isExpanded, onToggleExpand }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState(SUGGESTED.slice(0, 3))
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    setSuggestions(SUGGESTED.sort(() => Math.random() - 0.5).slice(0, 3))
  }, [initialContext])

  const sendMessage = useCallback(
    async (text) => {
      const q = text.trim()
      if (!q || loading) return

      setMessages((ms) => [...ms, { role: 'user', content: q }])
      setInput('')
      setLoading(true)
      setSuggestions([])

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setMessages((ms) => [...ms, { role: 'assistant', content: '', streaming: true }])

      try {
        const res = await fetch(`${apiBaseUrl}/visits/${visitId}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('shifa_token')}` },
          body: JSON.stringify({ message: q, context: initialContext }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const reader = res.body.getReader()
        const dec = new TextDecoder()
        let full = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = dec.decode(value)
          chunk.split('\n').forEach((line) => {
            if (line.startsWith('data: ')) {
              const payload = line.slice(6).trim()
              if (payload === '[DONE]') return
              try {
                const { text } = JSON.parse(payload)
                if (text) {
                  full += text
                  setMessages((ms) => ms.map((m, i) => (i === ms.length - 1 ? { ...m, content: full } : m)))
                }
              } catch {
                // silent
              }
            }
          })
        }

        setMessages((ms) => ms.map((m, i) => (i === ms.length - 1 ? { ...m, streaming: false } : m)))
      } catch (err) {
        if (err.name !== 'AbortError') {
          setMessages((ms) => ms.map((m, i) => (i === ms.length - 1 ? { ...m, content: 'Sorry, something went wrong. Please try again.', streaming: false, error: true } : m)))
        }
      } finally {
        setLoading(false)
      }
    },
    [visitId, loading, initialContext, apiBaseUrl],
  )

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 shrink-0">
        <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-emerald-600 text-base leading-none">✓✓</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">Shifa AI</p>
          {initialContext && <p className="text-xs text-emerald-600 truncate">{initialContext}</p>}
        </div>
        <div className="flex items-center gap-1">
          {onToggleExpand && (
            <button onClick={onToggleExpand} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center pt-8 pb-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mb-4">✓✓</div>
            <p className="font-semibold text-gray-800 mb-1">Your visit assistant</p>
            <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full mb-3">{initialContext ?? 'Visit Summary'}</p>
            <p className="text-sm text-gray-500 leading-relaxed">Ask me anything about your visit.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={[
                'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user' ? 'bg-emerald-500 text-white rounded-br-sm' : msg.error ? 'bg-red-50 border border-red-200 text-red-700 rounded-bl-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm',
              ].join(' ')}
            >
              {msg.content || (msg.streaming && <DotPulse label="" />)}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <DotPulse />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {suggestions.length > 0 && messages.length === 0 && (
        <div className="px-4 pb-2 space-y-2 shrink-0">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)} className="w-full text-left text-sm text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-xl px-4 py-2.5 transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 py-3 border-t border-gray-100 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            placeholder="Ask about your visit…"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
