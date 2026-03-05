import { useState, useRef, useEffect } from 'react'

export default function MedicalTermHighlight({ text, terms = [], onTermClick, highlightColor = 'text-emerald-700 underline decoration-emerald-400 decoration-dotted underline-offset-2' }) {
  if (!terms.length) return <>{text}</>

  const sorted = [...terms].sort((a, b) => a.start - b.start)
  const parts = []
  let cursor = 0

  sorted.forEach((t, idx) => {
    if (t.start > cursor) parts.push({ type: 'text', text: text.slice(cursor, t.start), key: `t${idx}` })
    parts.push({ type: 'term', text: text.slice(t.start, t.end), term: t, key: `term${idx}` })
    cursor = t.end
  })
  if (cursor < text.length) parts.push({ type: 'text', text: text.slice(cursor), key: 'tail' })

  return (
    <>
      {parts.map((p) =>
        p.type === 'text' ? (
          <span key={p.key}>{p.text}</span>
        ) : (
          <TermSpan key={p.key} entry={p.term} onTermClick={onTermClick} highlightColor={highlightColor}>
            {p.text}
          </TermSpan>
        ),
      )}
    </>
  )
}

function TermSpan({ children, entry, onTermClick, highlightColor }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!showTooltip) return
    const h = (e) => {
      if (!ref.current?.contains(e.target)) setShowTooltip(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showTooltip])

  return (
    <span ref={ref} className="relative inline">
      <button type="button" onClick={() => setShowTooltip((o) => !o)} className={`${highlightColor} cursor-pointer hover:opacity-75 transition-opacity focus:outline-none`}>
        {children}
      </button>

      {showTooltip && (
        <span className="absolute z-30 bottom-full left-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-xl leading-relaxed">
          <span className="font-semibold block mb-1">{entry.term}</span>
          {entry.definition && <span className="text-gray-300">{entry.definition}</span>}
          {onTermClick && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTermClick(entry)
                setShowTooltip(false)
              }}
              className="mt-2 w-full text-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Explain this →
            </button>
          )}
          <span className="absolute -bottom-1.5 left-4 w-3 h-3 bg-gray-900 rotate-45" />
        </span>
      )}
    </span>
  )
}
