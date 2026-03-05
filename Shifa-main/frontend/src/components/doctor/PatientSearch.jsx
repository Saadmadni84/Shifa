import { useState, useRef, useEffect } from 'react'
import { Search, X, User, Phone } from 'lucide-react'
import { searchPatients } from '@/api'
import Avatar from '../ui/Avatar'
import Spinner from '../ui/Spinner'

function useDebounce(v, d = 300) {
  const [r, setR] = useState(v)
  useEffect(() => {
    const t = setTimeout(() => setR(v), d)
    return () => clearTimeout(t)
  }, [v, d])
  return r
}

export default function PatientSearch({ onSelect, placeholder = 'Search patient by name or phone…', className = '' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounced = useDebounce(query)
  const inputRef = useRef(null)

  useEffect(() => {
    if (debounced.length < 2) {
      setResults([])
      return
    }
    let cancelled = false
    setLoading(true)
    searchPatients({ q: debounced, size: 8 })
      .then((d) => {
        if (!cancelled) {
          setResults(d.content ?? d)
          setOpen(true)
        }
      })
      .catch(() => {
        if (!cancelled) setResults([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debounced])

  const select = (p) => {
    setQuery(`${p.firstName} ${p.lastName}`)
    setResults([])
    setOpen(false)
    onSelect?.(p)
  }
  const clear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
    onSelect?.(null)
    inputRef.current?.focus()
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-300 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <Spinner size={15} />
          </div>
        )}
        {!loading && query && (
          <button type="button" onClick={clear} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 w-full mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg py-1 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {results.length > 0 ? (
              results.map((p) => (
                <button key={p.id} type="button" onClick={() => select(p)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                  <Avatar firstName={p.firstName} lastName={p.lastName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {p.firstName} {p.lastName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Phone size={10} className="text-gray-400" />
                      <p className="text-xs text-gray-500">{p.phoneNumber}</p>
                      {p.chronicConditions?.[0] && <span className="text-xs text-gray-400">· {p.chronicConditions[0]}</span>}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-6 text-center">
                <User size={20} className="text-gray-300 mx-auto mb-1" />
                <p className="text-sm text-gray-500">No patient found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
