export default function Spinner({ size = 24, className = '', color = 'text-emerald-500' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${color} ${className}`}
      aria-label="Loading"
      role="status"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

export function PageLoader({ message = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-4">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
        <Spinner size={32} />
      </div>
      <p className="text-sm text-gray-500 font-medium">{message}</p>
    </div>
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded-full w-3/5" />
          <div className="h-2.5 bg-gray-200 rounded-full w-2/5" />
        </div>
      </div>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className="h-2.5 bg-gray-200 rounded-full" style={{ width: `${60 + i * 10}%` }} />
      ))}
    </div>
  )
}

export function DotPulse({ label = 'AI is thinking…' }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
      {label}
    </div>
  )
}
