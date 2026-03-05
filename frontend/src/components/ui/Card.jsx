export default function Card({ children, title, subtitle, action, icon, padding = 'md', className = '', variant = 'default', onClick, ...props }) {
  const P = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }
  const B = {
    default: 'border-gray-200 bg-white',
    emerald: 'border-emerald-200 bg-emerald-50/30',
    blue: 'border-blue-200 bg-blue-50/30',
    amber: 'border-amber-200 bg-amber-50/30',
    red: 'border-red-200 bg-red-50/30',
  }
  return (
    <div
      onClick={onClick}
      className={['rounded-2xl border shadow-sm', B[variant] ?? B.default, onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '', className].join(' ')}
      {...props}
    >
      {(title || action) && (
        <div className={`flex items-start justify-between ${P.md} pb-0`}>
          <div className="flex items-center gap-3">
            {icon && <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">{icon}</div>}
            <div>
              {title && <h3 className="font-semibold text-gray-900 text-sm leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0 ml-4">{action}</div>}
        </div>
      )}
      <div className={P[padding]}>{children}</div>
    </div>
  )
}
